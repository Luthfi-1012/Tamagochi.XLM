import React from "react";
import { useGame } from "~/context/game-context";
import { CreatePetDialog } from "./create-pet-dialog";
import { useWallet } from "~/hooks/use-wallet";

export function PetDisplay() {
  const { gameState } = useGame();
  const { isConnected } = useWallet();
  const { petMood, equippedItems, isSleeping, petName, hasRealPet, level, evolutionStage } = gameState;

  // Determine pet appearance color explicitly to avoid default black SVG fill
  // Use yellow for happy/neutral, sea blue for sleeping/sad
  const getPetColor = () => {
    switch (petMood) {
      case "happy":
        return "fill-yellow-400"; // bright yellow
      case "neutral":
        return "fill-yellow-300";
      case "sleeping":
        return "fill-sky-300"; // sea blue
      case "sad":
        return "fill-sky-400"; // sea blue
      default:
        return "fill-yellow-400";
    }
  };

  const hasGlasses = equippedItems.includes("cool-glasses");
  const hasHat = equippedItems.includes("hat");
  const hasJacket = equippedItems.includes("jacket");
  const hasHeadset = equippedItems.includes("headset");
  const hasSword = equippedItems.includes("pedang");

  // Size/layout varies by evolution stage
  const evo = evolutionStage ?? 1;
  const body =
    evo === 1
      ? { x: 6, y: 8, w: 12, h: 10 }
      : evo === 2
        ? { x: 5, y: 7, w: 14, h: 11 }
        : { x: 4, y: 6, w: 16, h: 12 };
  const leftEar = evo === 1 ? { x: 5, y: 6, w: 2, h: 3 } : evo === 2 ? { x: 4, y: 5, w: 3, h: 3 } : { x: 3, y: 4, w: 3, h: 4 };
  const rightEar = evo === 1 ? { x: 17, y: 6, w: 2, h: 3 } : evo === 2 ? { x: 17, y: 5, w: 3, h: 3 } : { x: 18, y: 4, w: 3, h: 4 };
  const topStripe = { x: body.x + 1, y: body.y - 1, w: body.w - 2, h: 1 };
  const bottomStripe = { x: body.x + 1, y: body.y + body.h - 1, w: body.w - 2, h: 1 };
  const isEvo2 = evo >= 2;
  const isEvo3 = evo >= 3;

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Pet Container */}
      <div
        className={`relative ${isSleeping ? "" : "animate-bounce"}`}
        style={{ animationDuration: "2s" }}
      >
        {/* Pixel Pet SVG - Cute 8-bit creature */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 24 24"
          className="drop-shadow-lg"
          style={{ imageRendering: "pixelated" }}
        >
          {/* Body - changes with evolution */}
          <rect x={body.x} y={body.y} width={body.w} height={body.h} className={getPetColor()} />
          {/* Arms */}
          <rect x={body.x - 1} y={body.y + 2} width={2} height={Math.max(6, body.h - 5)} className={getPetColor()} />
          <rect x={body.x + body.w - 1} y={body.y + 2} width={2} height={Math.max(6, body.h - 5)} className={getPetColor()} />
          {/* Stripes */}
          <rect x={topStripe.x} y={topStripe.y} width={topStripe.w} height={topStripe.h} className={getPetColor()} />
          <rect x={bottomStripe.x} y={bottomStripe.y} width={bottomStripe.w} height={bottomStripe.h} className={getPetColor()} />

          {/* Ears */}
          <rect x={leftEar.x} y={leftEar.y} width={leftEar.w} height={leftEar.h} className={getPetColor()} />
          <rect x={rightEar.x} y={rightEar.y} width={rightEar.w} height={rightEar.h} className={getPetColor()} />

          {/* Eyes */}
          {petMood === "sleeping" ? (
            <>
              <rect x="9" y="11" width="2" height="1" className="fill-foreground" />
              <rect x="13" y="11" width="2" height="1" className="fill-foreground" />
            </>
          ) : (
            <>
              <rect x="9" y="11" width="2" height="2" className="fill-foreground" />
              <rect x="13" y="11" width="2" height="2" className="fill-foreground" />
              {isEvo3 && (
                // tiny sparkle pixels at top-right of each eye
                <>
                  <rect x="10" y="10" width="1" height="1" className="fill-foreground opacity-70" />
                  <rect x="14" y="10" width="1" height="1" className="fill-foreground opacity-70" />
                </>
              )}
            </>
          )}

          {/* Evolution stage 2+ belly highlight */}
          {isEvo2 && (
            <rect
              x={body.x + Math.floor(body.w / 4)}
              y={body.y + Math.floor(body.h / 3)}
              width={Math.max(4, Math.floor(body.w / 2))}
              height={Math.max(2, Math.floor(body.h / 3))}
              className="fill-background"
            />
          )}

          {/* Evolution stage 2+ small tail */}
          {isEvo2 && (
            <>
              <rect x={body.x + body.w} y={body.y + 4} width={2} height={2} className={getPetColor()} />
              {isEvo3 && (
                <rect x={body.x + body.w + 1} y={body.y + 3} width={1} height={2} className={getPetColor()} />
              )}
            </>
          )}

          {/* Evolution stage 3 head crest and chest emblem */}
          {isEvo3 && (
            <>
              {/* Head crest */}
              <rect x={body.x + Math.floor(body.w / 2) - 1} y={body.y - 3} width={2} height={2} className="fill-foreground" />
              <rect x={body.x + Math.floor(body.w / 2)} y={body.y - 4} width={1} height={1} className="fill-foreground" />
              {/* Chest emblem */}
              <rect x={body.x + Math.floor(body.w / 2) - 1} y={body.y + Math.floor(body.h / 2)} width={2} height={2} className="fill-accent" />
            </>
          )}

          {/* Mouth - changes based on mood */}
          {petMood === "happy" && (
            <>
              <rect x="9" y="15" width="1" height="1" className="fill-foreground" />
              <rect x="10" y="16" width="4" height="1" className="fill-foreground" />
              <rect x="14" y="15" width="1" height="1" className="fill-foreground" />
            </>
          )}
          {petMood === "sad" && (
            <>
              <rect x="9" y="16" width="1" height="1" className="fill-foreground" />
              <rect x="10" y="15" width="4" height="1" className="fill-foreground" />
              <rect x="14" y="16" width="1" height="1" className="fill-foreground" />
            </>
          )}
          {petMood === "neutral" && (
            <rect x="10" y="15" width="4" height="1" className="fill-foreground" />
          )}
          {petMood === "sleeping" && (
            <rect x="10" y="15" width="4" height="1" className="fill-foreground" />
          )}

          {/* Cool Glasses overlay */}
          {hasGlasses && (
            <g>
              <rect x="8" y="10" width="3" height="3" className="fill-foreground opacity-80" />
              <rect x="13" y="10" width="3" height="3" className="fill-foreground opacity-80" />
              <rect x="11" y="11" width="2" height="1" className="fill-foreground" />
            </g>
          )}

          {/* Hat overlay */}
          {hasHat && (
            <g>
              {/* Simple cap on top of head */}
              <rect x="7" y="5" width="10" height="2" className="fill-foreground" />
              <rect x="6" y="7" width="12" height="1" className="fill-foreground" />
            </g>
          )}

          {/* Jacket overlay */}
          {hasJacket && (
            <g>
              {/* Torso overlay with different color */}
              <rect x="6" y="12" width="12" height="6" className="fill-secondary" />
              {/* Jacket collar */}
              <rect x="10" y="11" width="1" height="2" className="fill-foreground" />
              <rect x="13" y="11" width="1" height="2" className="fill-foreground" />
            </g>
          )}

          {/* Headset overlay (ear cups + band) */}
          {hasHeadset && (
            <g>
              {/* band */}
              <rect x={body.x + 2} y={body.y - 2} width={body.w - 4} height={1} className="fill-foreground" />
              {/* ear cups */}
              <rect x={leftEar.x - 1} y={leftEar.y + 1} width={2} height={2} className="fill-foreground" />
              <rect x={rightEar.x + rightEar.w - 1} y={rightEar.y + 1} width={2} height={2} className="fill-foreground" />
              {/* mic boom */}
              <rect x={body.x + body.w - 3} y={body.y + 2} width={3} height={1} className="fill-foreground" />
            </g>
          )}

          {/* Sword overlay (held on right side) */}
          {hasSword && (
            <g>
              {/* blade */}
              <rect x={body.x + body.w + 1} y={body.y + Math.floor(body.h / 2) - 3} width={1} height={8} className="fill-foreground" />
              {/* hilt */}
              <rect x={body.x + body.w} y={body.y + Math.floor(body.h / 2) + 1} width={3} height={1} className="fill-foreground" />
            </g>
          )}

          {/* Feet */}
          <rect x={body.x + 2} y={body.y + body.h + 1} width={2} height={2} className={getPetColor()} />
          <rect x={body.x + body.w - 4} y={body.y + body.h + 1} width={2} height={2} className={getPetColor()} />
        </svg>

        {/* Sleep Z's */}
        {isSleeping && (
          <div className="absolute -top-4 right-0 text-2xl animate-pulse">
            <div className="pixel-text-shadow">💤</div>
          </div>
        )}
      </div>

      {/* Pet Status Text */}
      <div className="mt-4 text-center">
        {petName && <h3 className="text-lg font-bold pixel-text-shadow mb-1">{petName}</h3>}
        {(level || evolutionStage) && (
          <div className="flex items-center justify-center gap-2 mb-1">
            {typeof level !== "undefined" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] bg-blue-100 text-blue-800 border border-blue-300">
                LV {level}
              </span>
            )}
            {typeof evolutionStage !== "undefined" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] bg-purple-100 text-purple-800 border border-purple-300">
                Evo {evolutionStage}
              </span>
            )}
          </div>
        )}
        {/* EXP progress */}
        {typeof level !== "undefined" && typeof gameState.exp !== "undefined" && (
          <div className="mx-auto mb-2 w-56 max-w-full">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>EXP</span>
              <span>
                {Math.max(0, Math.min(100, Math.round(gameState.exp)))} / 100
              </span>
            </div>
            <div className="h-2 w-full border-2 border-border bg-muted relative overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${Math.max(0, Math.min(100, gameState.exp ?? 0))}%` }}
              />
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {isSleeping
            ? "💤 Sleeping"
            : petMood === "happy"
              ? "😊 Happy"
              : petMood === "sad"
                ? "😢 Sad"
                : "😐 Okay"}
        </p>
        {isConnected && hasRealPet && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-300">
              ⭐ On Stellar
            </span>
          </div>
        )}
        {isConnected && !hasRealPet && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 mb-3">
              🏠 Local Pet
            </span>
            <div>
              <CreatePetDialog />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
