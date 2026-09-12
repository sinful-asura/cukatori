"""PIDs listening on a TCP port — OS APIs, no netstat/lsof/ss."""

from __future__ import annotations

import os
import socket
import sys
from pathlib import Path

_TCP_LISTEN = "0A"


def pids_on_port(port: int) -> set[int]:
    if sys.platform == "win32":
        return _windows(port)
    if Path("/proc/net/tcp").is_file():
        return _linux(port)
    return set()


def _linux(port: int) -> set[int]:
    inodes = _linux_listen_inodes(port)
    if not inodes:
        return set()
    pids: set[int] = set()
    try:
        proc_entries = os.scandir("/proc")
    except OSError:
        return set()
    with proc_entries:
        for entry in proc_entries:
            if not entry.name.isdigit():
                continue
            try:
                fds = os.scandir(f"/proc/{entry.name}/fd")
            except OSError:
                continue
            with fds:
                for fd in fds:
                    try:
                        target = os.readlink(fd.path)
                    except OSError:
                        continue
                    if not (target.startswith("socket:[") and target.endswith("]")):
                        continue
                    try:
                        inode = int(target[8:-1])
                    except ValueError:
                        continue
                    if inode in inodes:
                        pids.add(int(entry.name))
                        break
    return pids


def _linux_listen_inodes(port: int) -> set[int]:
    suffix = f":{port:04X}"
    inodes: set[int] = set()
    for path in ("/proc/net/tcp", "/proc/net/tcp6"):
        try:
            lines = Path(path).read_text(encoding="utf-8").splitlines()[1:]
        except OSError:
            continue
        for line in lines:
            parts = line.split()
            if len(parts) < 10:
                continue
            local, state, inode = parts[1], parts[3].upper(), parts[9]
            if state != _TCP_LISTEN or not local.upper().endswith(suffix):
                continue
            try:
                inodes.add(int(inode))
            except ValueError:
                continue
    return inodes


def _windows(port: int) -> set[int]:
    import ctypes
    from ctypes import wintypes

    iphlpapi = ctypes.WinDLL("iphlpapi")
    iphlpapi.GetExtendedTcpTable.argtypes = [
        ctypes.c_void_p,
        ctypes.POINTER(wintypes.DWORD),
        wintypes.BOOL,
        wintypes.ULONG,
        ctypes.c_int,
        wintypes.ULONG,
    ]
    iphlpapi.GetExtendedTcpTable.restype = wintypes.DWORD

    class Tcp4(ctypes.Structure):
        _fields_ = [
            ("dwState", wintypes.DWORD),
            ("dwLocalAddr", wintypes.DWORD),
            ("dwLocalPort", wintypes.DWORD),
            ("dwRemoteAddr", wintypes.DWORD),
            ("dwRemotePort", wintypes.DWORD),
            ("dwOwningPid", wintypes.DWORD),
        ]

    class Tcp6(ctypes.Structure):
        _fields_ = [
            ("ucLocalAddr", ctypes.c_ubyte * 16),
            ("dwLocalScopeId", wintypes.DWORD),
            ("dwLocalPort", wintypes.DWORD),
            ("ucRemoteAddr", ctypes.c_ubyte * 16),
            ("dwRemoteScopeId", wintypes.DWORD),
            ("dwRemotePort", wintypes.DWORD),
            ("dwState", wintypes.DWORD),
            ("dwOwningPid", wintypes.DWORD),
        ]

    af_inet, af_inet6 = 2, 23
    table_listener = 3
    insufficient = 122

    def collect(family: int, row_cls: type[ctypes.Structure]) -> set[int]:
        size = wintypes.DWORD(0)
        ret = iphlpapi.GetExtendedTcpTable(
            None, ctypes.byref(size), False, family, table_listener, 0
        )
        if ret not in (0, insufficient) or size.value == 0:
            return set()
        buf = ctypes.create_string_buffer(size.value)
        ret = iphlpapi.GetExtendedTcpTable(
            buf, ctypes.byref(size), False, family, table_listener, 0
        )
        if ret != 0:
            return set()
        count = wintypes.DWORD.from_buffer_copy(buf, 0).value
        header = ctypes.sizeof(wintypes.DWORD)
        row_size = ctypes.sizeof(row_cls)
        pids: set[int] = set()
        for i in range(count):
            start = header + i * row_size
            if start + row_size > size.value:
                break
            row = row_cls.from_buffer_copy(buf, start)
            if socket.ntohs(row.dwLocalPort & 0xFFFF) != port:
                continue
            if row.dwOwningPid > 0:
                pids.add(int(row.dwOwningPid))
        return pids

    return collect(af_inet, Tcp4) | collect(af_inet6, Tcp6)
