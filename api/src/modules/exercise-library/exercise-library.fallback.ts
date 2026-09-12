import type { LibraryExerciseDto } from '../../contracts/exercise-library.js';

/**
 * Bundled catalogue used whenever MuscleWiki is unreachable or unkeyed (their direct API
 * is a paid tier). Small on purpose: enough to build and demo against, never a mirror of
 * upstream. Fields follow the same shape, so swapping in the real API changes nothing
 * downstream — only `source` on the response flips to `musclewiki`.
 */
const MEDIA_BASE = 'https://media.musclewiki.com/media/uploads/videos/branded';

type Seed = [
  id: string,
  name: string,
  muscles: string,
  category: string,
  force: LibraryExerciseDto['force'],
  mechanic: LibraryExerciseDto['mechanic'],
  difficulty: LibraryExerciseDto['difficulty'],
  steps: string,
  /** MuscleWiki clip slug, or '' where they publish none under a name we could verify. */
  media: string,
];

const SEEDS: Seed[] = [
  ['bench-press', 'Barbell Bench Press', 'Chest,Triceps,Shoulders', 'Barbell', 'push', 'compound', 'intermediate', 'Lie flat and set your grip just outside shoulder width.|Unrack and lower the bar to mid-chest with elbows tucked.|Press back to lockout without flaring the elbows.', 'male-barbell-bench-press'],
  ['incline-db-press', 'Incline Dumbbell Press', 'Chest,Shoulders', 'Dumbbell', 'push', 'compound', 'novice', 'Set the bench to roughly 30 degrees.|Press the dumbbells up and slightly together.|Lower under control until you feel a stretch across the chest.', ''],
  ['push-up', 'Push-up', 'Chest,Triceps,Core', 'Bodyweight', 'push', 'compound', 'novice', 'Start in a plank with hands under the shoulders.|Lower until the chest is just off the floor.|Press back up while keeping the ribs down.', 'male-Bodyweight-push-up'],
  ['barbell-squat', 'Barbell Back Squat', 'Quads,Glutes,Core', 'Barbell', 'push', 'compound', 'intermediate', 'Set the bar across the upper back and brace.|Sit down and back until the hips pass the knees.|Drive through mid-foot to stand.', 'male-Barbell-barbell-squat'],
  ['goblet-squat', 'Goblet Squat', 'Quads,Glutes', 'Dumbbell', 'push', 'compound', 'novice', 'Hold a dumbbell against your chest.|Squat between your knees keeping the torso upright.|Stand back up without letting the elbows drop.', ''],
  ['deadlift', 'Conventional Deadlift', 'Hamstrings,Glutes,Back', 'Barbell', 'pull', 'compound', 'advanced', 'Set your feet hip-width with the bar over mid-foot.|Take the slack out and pull the chest tall.|Push the floor away and lock out with the hips and knees together.', 'male-Barbell-barbell-deadlift'],
  ['romanian-deadlift', 'Romanian Deadlift', 'Hamstrings,Glutes', 'Barbell', 'pull', 'compound', 'intermediate', 'Start standing with the bar at the hips.|Push the hips back and slide the bar down the thighs.|Stop at the end of your hamstring range and stand back up.', 'male-Barbell-barbell-romanian-deadlift'],
  ['pull-up', 'Pull-up', 'Lats,Biceps', 'Bodyweight', 'pull', 'compound', 'intermediate', 'Hang from the bar with an overhand grip.|Pull the elbows down towards the ribs.|Lower all the way to a full hang.', ''],
  ['lat-pulldown', 'Lat Pulldown', 'Lats,Biceps', 'Cable', 'pull', 'compound', 'novice', 'Set the thigh pad so you stay seated.|Pull the bar to the upper chest leading with the elbows.|Control the bar back to full stretch.', ''],
  ['barbell-row', 'Barbell Row', 'Back,Lats,Biceps', 'Barbell', 'pull', 'compound', 'intermediate', 'Hinge forward to roughly 45 degrees.|Row the bar to the lower ribs.|Lower under control without rounding the back.', 'male-barbell-bent-over-row'],
  ['overhead-press', 'Overhead Press', 'Shoulders,Triceps', 'Barbell', 'push', 'compound', 'intermediate', 'Start with the bar at the front of the shoulders.|Press overhead, moving the head back then through.|Lock out with the bar over mid-foot.', 'male-barbell-overhead-press'],
  ['lateral-raise', 'Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell', 'push', 'isolation', 'novice', 'Stand with dumbbells at your sides.|Raise out to shoulder height with soft elbows.|Lower slowly rather than dropping.', ''],
  ['barbell-curl', 'Barbell Curl', 'Biceps', 'Barbell', 'pull', 'isolation', 'novice', 'Hold the bar with an underhand shoulder-width grip.|Curl up keeping the elbows pinned to your sides.|Lower to a full stretch.', 'male-Barbell-barbell-curl'],
  ['triceps-pushdown', 'Cable Triceps Pushdown', 'Triceps', 'Cable', 'push', 'isolation', 'novice', 'Set the cable at head height.|Push down until the elbows lock.|Return to a 90 degree bend under control.', ''],
  ['hip-thrust', 'Barbell Hip Thrust', 'Glutes,Hamstrings', 'Barbell', 'push', 'compound', 'novice', 'Sit with your upper back on a bench and the bar across the hips.|Drive the hips up until the torso is parallel to the floor.|Lower without letting the ribs flare.', 'male-Barbell-barbell-hip-thrust'],
  ['plank', 'Plank', 'Core', 'Bodyweight', 'static', 'isolation', 'novice', 'Set your elbows under the shoulders.|Squeeze the glutes and brace the midsection.|Hold a straight line from head to heels.', ''],
];

export const LIBRARY_FALLBACK: LibraryExerciseDto[] = SEEDS.map(
  ([id, name, muscles, category, force, mechanic, difficulty, steps, media]) => ({
    id,
    name,
    primaryMuscles: muscles.split(','),
    category,
    force,
    grips: [],
    mechanic,
    difficulty,
    steps: steps.split('|'),
    videos: media
      ? [
          { url: `${MEDIA_BASE}/${media}-front.mp4`, variant: 'front', thumbnail: null },
          { url: `${MEDIA_BASE}/${media}-side.mp4`, variant: 'side', thumbnail: null },
        ]
      : [],
    bodymap: { male: null, female: null },
  }),
);
