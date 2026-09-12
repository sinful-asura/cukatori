import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  CompleteWorkoutRequest,
  CreateWorkoutRequest,
  CreateWorkoutSetRequest,
  ExerciseDto,
  ExerciseListQuery,
  PersonalRecordDto,
  WorkoutDto,
  WorkoutListQuery,
} from '@ascend-os/shared/exercise';
import { environment } from '../environment';

/** `/exercises` is the MuscleWiki library; the loggable lifts live under `/catalog`. */
@Injectable({ providedIn: 'root' })
export class ExerciseApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listExercises(query: ExerciseListQuery = {}): Observable<ExerciseDto[]> {
    let params = new HttpParams();
    if (query.muscle) {
      params = params.set('muscle', query.muscle);
    }
    if (query.q) {
      params = params.set('q', query.q);
    }
    return this.http.get<ExerciseDto[]>(`${this.base}/catalog/exercises`, { params });
  }

  getExercise(id: string): Observable<ExerciseDto> {
    return this.http.get<ExerciseDto>(`${this.base}/catalog/exercises/${id}`);
  }

  listWorkouts(query: WorkoutListQuery = {}): Observable<WorkoutDto[]> {
    let params = new HttpParams();
    if (query.status) {
      params = params.set('status', query.status);
    }
    return this.http.get<WorkoutDto[]>(`${this.base}/workouts`, { params });
  }

  getWorkout(id: string): Observable<WorkoutDto> {
    return this.http.get<WorkoutDto>(`${this.base}/workouts/${id}`);
  }

  createWorkout(body: CreateWorkoutRequest): Observable<WorkoutDto> {
    return this.http.post<WorkoutDto>(`${this.base}/workouts`, body);
  }

  addSet(workoutId: string, body: CreateWorkoutSetRequest): Observable<WorkoutDto> {
    return this.http.post<WorkoutDto>(`${this.base}/workouts/${workoutId}/sets`, body);
  }

  removeSet(workoutId: string, setId: string): Observable<WorkoutDto> {
    return this.http.delete<WorkoutDto>(`${this.base}/workouts/${workoutId}/sets/${setId}`);
  }

  completeWorkout(workoutId: string, body: CompleteWorkoutRequest = {}): Observable<WorkoutDto> {
    return this.http.post<WorkoutDto>(`${this.base}/workouts/${workoutId}/complete`, body);
  }

  listPrs(): Observable<PersonalRecordDto[]> {
    return this.http.get<PersonalRecordDto[]>(`${this.base}/prs`);
  }
}
