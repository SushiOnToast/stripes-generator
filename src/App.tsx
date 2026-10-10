import { useEffect, useRef, useState } from "react";
import { drawStripes, type Orientation } from "./patterns/stripes";
import { drawBayadere } from "./patterns/bayadere";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Shuffle, X } from "lucide-react";

const MIN_COLOURS = 2;
const MIN_SIZE = 64;
const MAX_SIZE = 4096;

const SIZE_PRESETS = [
  { label: "Default", w: 800, h: 600 },
  { label: "Square", w: 1080, h: 1080 },
  { label: "Landscape", w: 1920, h: 1080 },
  { label: "Portrait", w: 1080, h: 1920 },
  { label: "Wallpaper", w: 2560, h: 1440 },
];

type Pattern = "stripes" | "bayadere";

function randomColour() {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}

// Number input that lets you type freely and only clamps when you finish
function SizeInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const n = Math.round(Number(draft));
    const next = Number.isFinite(n)
      ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, n))
      : value;
    onCommit(next);
    setDraft(String(next));
  };

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pattern, setPattern] = useState<Pattern>("stripes");
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [stripeWidth, setStripeWidth] = useState(40);
  const [colours, setColours] = useState<string[]>([
    "#1d3557",
    "#f1faee",
    "#e63946",
  ]);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 32));
  const [size, setSize] = useState({ w: 800, h: 600 });

  // Slider range scales with the canvas, so it feels right at any size
  const length = orientation === "vertical" ? size.w : size.h;
  const maxStripe = Math.max(20, Math.round(length / 4));
  const effectiveStripe = Math.min(stripeWidth, maxStripe);

  const updateColour = (index: number, value: string) =>
    setColours((prev) => prev.map((c, i) => (i === index ? value : c)));

  const addColour = () => setColours((prev) => [...prev, randomColour()]);

  const removeColour = (index: number) =>
    setColours((prev) =>
      prev.length > MIN_COLOURS ? prev.filter((_, i) => i !== index) : prev,
    );

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pattern}-${size.w}x${size.h}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (pattern === "stripes") {
      drawStripes(ctx, size.w, size.h, colours, effectiveStripe, orientation);
    } else {
      drawBayadere(
        ctx,
        size.w,
        size.h,
        colours,
        effectiveStripe,
        orientation,
        seed,
      );
    }
  }, [colours, effectiveStripe, orientation, pattern, seed, size]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-lg font-semibold tracking-tight">Stripes Generator</h1>
          <Button onClick={downloadImage}>
            <Download />
            <span className="hidden sm:inline">Download PNG</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </header>

      {/* One column by default; sidebar on the right from 1024px up */}
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Preview */}
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border bg-muted/40 p-4 sm:p-8">
          <canvas
            ref={canvasRef}
            width={size.w}
            height={size.h}
            className="block h-auto max-h-[70vh] w-auto max-w-full rounded-md shadow-lg"
          />
        </div>

        {/* Controls */}
        <aside className="flex flex-col gap-6 rounded-xl border bg-card p-5 lg:sticky lg:top-6 lg:self-start">
          <Section title="Pattern">
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                variant="outline"
                value={[pattern]}
                onValueChange={(v) => {
                  if (v.length > 0) setPattern(v[0] as Pattern);
                }}
              >
                <ToggleGroupItem value="stripes">Stripes</ToggleGroupItem>
                <ToggleGroupItem value="bayadere">Bayadère</ToggleGroupItem>
              </ToggleGroup>
              {pattern === "bayadere" && (
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Shuffle"
                  onClick={() => setSeed(Math.floor(Math.random() * 2 ** 32))}
                >
                  <Shuffle />
                </Button>
              )}
            </div>
          </Section>

          <Section title="Direction">
            <ToggleGroup
              variant="outline"
              value={[orientation]}
              onValueChange={(v) => {
                if (v.length > 0) setOrientation(v[0] as Orientation);
              }}
            >
              <ToggleGroupItem value="vertical">Vertical</ToggleGroupItem>
              <ToggleGroupItem value="horizontal">Horizontal</ToggleGroupItem>
            </ToggleGroup>
          </Section>

          <Section
            title={pattern === "stripes" ? "Stripe width" : "Base width"}
          >
            <div className="flex items-center gap-4">
              <Slider
                min={4}
                max={maxStripe}
                step={1}
                value={effectiveStripe}
                onValueChange={(v) =>
                  setStripeWidth(typeof v === "number" ? v : v[0])
                }
              />
              <span className="w-14 text-right text-sm tabular-nums text-muted-foreground">
                {effectiveStripe}px
              </span>
            </div>
          </Section>

          <Section title={`Colours (${colours.length})`}>
            <div className="flex flex-wrap gap-3">
              {colours.map((colour, i) => (
                <div key={i} className="group relative">
                  <label
                    className="relative block h-12 w-12 cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: colour }}
                  >
                    <input
                      type="color"
                      value={colour}
                      onChange={(e) => updateColour(i, e.target.value)}
                      aria-label={`Colour ${i + 1}`}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </label>
                  {colours.length > MIN_COLOURS && (
                    <button
                      type="button"
                      onClick={() => removeColour(i)}
                      aria-label={`Remove colour ${i + 1}`}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addColour}
                aria-label="Add colour"
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <Plus />
              </button>
            </div>
          </Section>

          <Section title="Image size">
            <div className="flex gap-2">
              <SizeInput
                label="Width"
                value={size.w}
                onCommit={(w) => setSize((s) => ({ ...s, w }))}
              />
              <SizeInput
                label="Height"
                value={size.h}
                onCommit={(h) => setSize((s) => ({ ...s, h }))}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SIZE_PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant={
                    size.w === p.w && size.h === p.h ? "secondary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSize({ w: p.w, h: p.h })}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </Section>
        </aside>
      </main>
    </div>
  );
}