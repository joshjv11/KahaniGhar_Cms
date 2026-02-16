"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { Slide } from "@/lib/types/database";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SlideEditorProps {
  slides: Slide[];
  onChange: (slides: Slide[]) => void;
}

function FilmstripItem({
  slide,
  index,
  isSelected,
  onSelect,
  onRemove,
}: {
  slide: Slide;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `slide-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer [&>img]:object-cover ${
        isSelected
          ? "border-[#FFB800] ring-2 ring-[#FFB800]/30"
          : "border-white/10 hover:border-white/30"
      } ${isDragging ? "opacity-50 z-10" : ""}`}
      onClick={onSelect}
    >
      {slide.image_url ? (
        <Image
          src={slide.image_url}
          alt={`Slide ${index + 1}`}
          fill
          className="object-cover w-full h-full"
          unoptimized
          sizes="96px"
        />
      ) : (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
          {index + 1}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1 px-2 flex items-center justify-between">
        <span className="text-[10px] text-white">{index + 1}</span>
        <button
          type="button"
          className="p-0.5 rounded hover:bg-white/20 text-slate-300 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove slide"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div
        className="absolute top-1 left-1 p-1 rounded bg-black/50 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}

export function SlideEditor({ slides, onChange }: SlideEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const addSlide = () => {
    const newSlides = [
      ...slides,
      { image_url: "", start_time: slides.length > 0 ? (slides[slides.length - 1].start_time + 5) : 0 },
    ];
    onChange(newSlides);
    setSelectedIndex(newSlides.length - 1);
  };

  const removeSlide = (index: number) => {
    const next = slides.filter((_, i) => i !== index);
    onChange(next);
    setSelectedIndex(Math.min(selectedIndex, Math.max(0, next.length - 1)));
  };

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((_, i) => `slide-${i}` === active.id);
      const newIndex = slides.findIndex((_, i) => `slide-${i}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(slides, oldIndex, newIndex);
        onChange(reordered);
        setSelectedIndex(newIndex);
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedSlide = slides[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Slides</Label>
        <Button type="button" variant="outline" size="sm" onClick={addSlide}>
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-white/10 rounded-lg">
          No slides yet. Click &quot;Add Slide&quot; to get started.
        </p>
      ) : (
        <>
          {/* Main preview + edit for selected slide */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-72 aspect-video rounded-lg overflow-hidden bg-slate-800 shrink-0">
                  {selectedSlide?.image_url ? (
                    <Image
                      src={selectedSlide.image_url}
                      alt={`Slide ${selectedIndex + 1}`}
                      width={288}
                      height={162}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                      Slide {selectedIndex + 1} — add image
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <h4 className="font-medium text-white">Slide {selectedIndex + 1}</h4>
                  <ImageUpload
                    value={selectedSlide?.image_url ?? ""}
                    onChange={(url) => updateSlide(selectedIndex, { image_url: url })}
                    folder="slides"
                    label="Slide Image"
                  />
                  <div className="space-y-2">
                    <Label htmlFor={`start_time_${selectedIndex}`}>
                      Start Time (seconds)
                    </Label>
                    <Input
                      id={`start_time_${selectedIndex}`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={selectedSlide?.start_time ?? 0}
                      onChange={(e) =>
                        updateSlide(selectedIndex, {
                          start_time: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => removeSlide(selectedIndex)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove this slide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filmstrip */}
          <div>
            <Label className="mb-2 block text-slate-400">Order — drag to reorder</Label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={slides.map((_, i) => `slide-${i}`)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {slides.map((slide, index) => (
                    <FilmstripItem
                      key={`slide-${index}`}
                      slide={slide}
                      index={index}
                      isSelected={index === selectedIndex}
                      onSelect={() => setSelectedIndex(index)}
                      onRemove={() => removeSlide(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </>
      )}
    </div>
  );
}
