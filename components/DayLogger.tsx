"use client";

import * as React from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadProgressPhoto } from "@/lib/upload";
import {
  WORKOUT_TYPES,
  NUTRITION_OPTIONS,
  INTENSITY_OPTIONS,
  NUTRITION_COLOR,
} from "@/lib/constants";
import { saveActivity, deleteActivity, type SaveResult } from "@/app/(app)/grid/actions";
import type { Activity, Intensity, Nutrition, WorkoutType } from "@/lib/types";

export function DayLogger({
  open,
  onClose,
  dayNumber,
  userId,
  existing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  dayNumber: number | null;
  userId: string;
  existing: Activity | null;
  onSaved: (result: SaveResult) => void;
}) {
  const [type, setType] = React.useState<WorkoutType>("Cardio");
  const [duration, setDuration] = React.useState("30");
  const [calories, setCalories] = React.useState("300");
  const [water, setWater] = React.useState("2");
  const [nutrition, setNutrition] = React.useState<Nutrition | null>("Healthy");
  const [intensity, setIntensity] = React.useState<Intensity>("Med");
  const [notes, setNotes] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Hydrate from existing entry whenever the sheet opens for a day.
  React.useEffect(() => {
    if (!open) return;
    setError(null);
    if (existing) {
      setType(existing.type);
      setDuration(String(existing.duration_min));
      setCalories(String(existing.calories));
      setWater(String(existing.water_liters));
      setNutrition(existing.nutrition);
      setIntensity((existing.intensity as Intensity) ?? "Med");
      setNotes(existing.notes ?? "");
      setPhotoUrl(existing.photo_url);
    } else {
      setType("Cardio");
      setDuration("30");
      setCalories("300");
      setWater("2");
      setNutrition("Healthy");
      setIntensity("Med");
      setNotes("");
      setPhotoUrl(null);
    }
  }, [open, existing]);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || dayNumber == null) return;
    setUploading(true);
    setError(null);
    const res = await uploadProgressPhoto(file, userId, dayNumber);
    setUploading(false);
    if (res.error) setError(res.error);
    else if (res.url) setPhotoUrl(res.url);
  }

  async function onSave() {
    if (dayNumber == null) return;
    setSaving(true);
    setError(null);
    const result = await saveActivity({
      day_number: dayNumber,
      type,
      duration_min: Number(duration) || 0,
      calories: Number(calories) || 0,
      water_liters: Number(water) || 0,
      nutrition,
      intensity,
      notes: notes.trim() || null,
      photo_url: photoUrl,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result);
    onClose();
  }

  async function onDelete() {
    if (dayNumber == null) return;
    setSaving(true);
    await deleteActivity(dayNumber);
    setSaving(false);
    onSaved({ ok: true, xpAwarded: 0, newBadges: [], milestone: null });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={dayNumber ? `Log Day ${dayNumber}` : "Log day"}>
      <div className="grid gap-5">
        {/* Photo */}
        <div>
          <Label>Progress photo</Label>
          <label
            className={cn(
              "cut relative grid place-items-center h-40 surface-2 cursor-pointer overflow-hidden focusable",
              "hover:brightness-110 transition",
            )}
          >
            {photoUrl ? (
              <Image src={photoUrl} alt="Progress" fill className="object-cover" sizes="440px" />
            ) : (
              <div className="text-center text-muted">
                {uploading ? (
                  <Loader2 className="mx-auto animate-spin" />
                ) : (
                  <>
                    <Camera className="mx-auto mb-1" />
                    <span className="text-xs">Add a photo</span>
                  </>
                )}
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="sr-only"
              onChange={onPickPhoto}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Type */}
        <div>
          <Label>Workout type</Label>
          <div className="grid grid-cols-3 gap-2">
            {WORKOUT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "cut h-11 font-mono uppercase text-xs font-bold focusable transition",
                  type === t ? "btn-accent" : "surface-2 text-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dur">Duration (min)</Label>
            <Input
              id="dur"
              type="number"
              inputMode="numeric"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cal">Calories</Label>
            <Input
              id="cal"
              type="number"
              inputMode="numeric"
              min={0}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="water">Water (L)</Label>
            <Input
              id="water"
              type="number"
              inputMode="decimal"
              step="0.5"
              min={0}
              value={water}
              onChange={(e) => setWater(e.target.value)}
            />
          </div>
          <div>
            <Label>Intensity</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {INTENSITY_OPTIONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={cn(
                    "cut h-11 font-mono text-[11px] font-bold focusable transition",
                    intensity === i ? "btn-accent" : "surface-2 text-muted",
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition */}
        <div>
          <Label>Nutrition</Label>
          <div className="grid grid-cols-3 gap-2">
            {NUTRITION_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setNutrition(n)}
                className="cut h-11 font-mono uppercase text-xs font-bold focusable transition surface-2"
                style={
                  nutrition === n
                    ? { background: NUTRITION_COLOR[n], color: "#06070a" }
                    : { color: NUTRITION_COLOR[n] }
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel?"
          />
        </div>

        {error ? (
          <p className="cut bg-miss/15 border border-miss/40 text-miss text-[13px] px-3 py-2">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button onClick={onSave} disabled={saving || uploading} className="flex-1" size="lg">
            {saving ? "Saving…" : existing ? "Update day" : "Complete day"}
          </Button>
          {existing ? (
            <Button variant="danger" size="lg" onClick={onDelete} disabled={saving} aria-label="Delete entry">
              <Trash2 size={18} />
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
