"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Product, ProductSlide } from "@/lib/products";
import { productHasMobile, productHasWeb } from "@/lib/products";

const EASE = [0.32, 0.9, 0.28, 1] as const;

/**
 * Photoreal orthographic textures (straight-on lid, top-down deck) mapped onto
 * real 3D planes. Because the source renders have no baked perspective, the CSS
 * perspective supplies all of it and the hinge is a genuine rotation.
 */
const LID_FRONT = "/products/devices/mbp-lid-front.png";
const LID_BACK = "/products/devices/mbp-lid-back.png";
const DECK = "/products/devices/mbp-deck-top.png";
const PHONE = "/products/devices/iphone-flat.png";

/** Shared chassis corner radius — matches processed texture rounding. */
const CHASSIS_RADIUS = "2.4%";

/** Keyboard deck plane, measured from the screen plane around the hinge. */
const DECK_TILT = 72;
/** Lid rest angles. -106deg is coplanar with the deck (72 - 180) plus 2deg of float. */
const LID_OPEN = 3.5;
const LID_CLOSED = -106;

/**
 * Wrapper is 100:84. The lid panel is 60.6% of the wrapper width tall (a 1.65
 * plane), the deck is the same depth so the closed lid covers it exactly, and
 * the deck's 72deg tilt foreshortens it to ~22% of the wrapper height.
 */
const PANEL_BAND = "72.15%";

/** Content rect inside the lid texture; the surrounding black reads as bezel. */
const LID_SCREEN = {
  top: "5.4%",
  left: "3.4%",
  width: "93.2%",
  height: "88%",
} as const;

/** Measured from iphone-flat.png (643x1391). */
const PHONE_SCREEN = {
  top: "3.67%",
  left: "3.42%",
  width: "93.16%",
  height: "92.81%",
  radius: "9%",
} as const;

const PHONE_W = 643;
const PHONE_H = 1391;

/**
 * Chassis depth as a fraction of the phone's width, slightly exaggerated over
 * the real 0.117 so the port still reads at this render size.
 */
const PHONE_DEPTH = 0.11;

/**
 * The chassis is extruded from the phone render's own silhouette rather than
 * drawn as a rail: copies stepped back in Z. A drawn strip can't win here —
 * the silhouette's lowest row spans only x 126..518 of 643, so a full-width
 * strip flares past the rounded corners while a 61% one reads as a small tab.
 * Stacked silhouettes follow the real outline at every angle for free.
 */
const PHONE_LAYERS = 14;
/** Step between layers, in % of the phone's width (container query units). */
const PHONE_LAYER_STEP = (PHONE_DEPTH * 100) / PHONE_LAYERS;

type ProductDeviceStageProps = {
  product: Product;
  showTag?: boolean;
  className?: string;
  /** Hide in-bezel UI while flat flight anchors own the shared-layout morph. */
  hideScreens?: boolean;
};

function screenOf(
  product: Product,
  kind: "web" | "mobile",
): ProductSlide | undefined {
  if (kind === "web") {
    return product.webScreen ?? product.hoverSlides[0];
  }
  return product.mobileScreen ?? product.hoverSlides[0];
}

export function ProductDeviceStage({
  product,
  showTag = false,
  className = "",
  hideScreens = false,
}: ProductDeviceStageProps) {
  const reduced = useReducedMotion();
  const hasWeb = productHasWeb(product);
  const hasMobile = productHasMobile(product);
  // Mobile-only products push the phone forward into the space the lid vacates.
  const phoneLead = hasMobile && !hasWeb;

  const web = screenOf(product, "web");
  const mobile = screenOf(product, "mobile");

  return (
    <div className={`relative h-full w-full bg-transparent ${className}`}>
      {/* Ambient light behind the devices — lifts them off the black page
          without haloing the lid itself. Sits first in DOM so it paints under
          the devices, which carry no z-index of their own. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-[6%] top-[14%] h-[76%] w-[78%] blur-2xl"
          style={{
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 50% 55%, rgba(78,150,240,0.17) 0%, rgba(38,92,190,0.09) 40%, rgba(20,50,120,0.03) 62%, transparent 76%)",
          }}
        />
        <div
          className="absolute bottom-[4%] left-[12%] h-[16%] w-[66%] blur-xl"
          style={{
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(120,190,255,0.13) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="absolute inset-0 flex items-end justify-center px-[1%] pb-[2%]">
        <div className="relative h-full w-full max-w-[48rem]">
          <div className="absolute bottom-0 left-[4%] h-[96%] aspect-[100/84]">
            <Laptop
              open={hasWeb}
              reduced={!!reduced}
              contentSrc={web?.src}
              contentAlt={web?.alt ?? `${product.name} on web`}
              hideScreen={hideScreens || !hasWeb}
            />
          </div>

          <Phone
            up={hasMobile}
            lead={phoneLead}
            reduced={!!reduced}
            contentSrc={mobile?.src}
            contentAlt={mobile?.alt ?? `${product.name} on mobile`}
            hideScreen={hideScreens || !hasMobile}
          />
        </div>
      </div>

      {showTag ? (
        <p className="absolute left-1 top-0 z-[3] max-w-[52%] text-[0.62rem] leading-relaxed text-white/45 sm:left-2">
          {product.tag}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The lid is a plane hinged at the deck's far edge, so closing is a real
 * rotation onto the keyboard. Past 90deg the front face turns away and CSS
 * hands over to the aluminium back cover, which is why no keys survive the fold.
 */
function Laptop({
  open,
  reduced,
  contentSrc,
  contentAlt,
  hideScreen,
}: {
  open: boolean;
  reduced: boolean;
  contentSrc?: string;
  contentAlt: string;
  hideScreen?: boolean;
}) {
  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: 1750, perspectiveOrigin: "50% 58%" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        // Camera leans over the shut machine so the cover reads as a top face.
        animate={reduced ? undefined : { rotateX: open ? 0 : 9 }}
        transition={{ duration: 0.95, ease: EASE }}
      >
        {/* Contact shadow, tightening as the machine closes. */}
        <motion.div
          className="absolute left-[6%] w-[88%] rounded-[50%] bg-black blur-xl"
          style={{ top: "88%", height: "9%" }}
          initial={false}
          animate={{ opacity: open ? 0.55 : 0.7 }}
          transition={{ duration: 0.95, ease: EASE }}
          aria-hidden
        />

        <div
          className="absolute left-0 w-full origin-top overflow-hidden"
          style={{
            top: PANEL_BAND,
            height: PANEL_BAND,
            transform: `rotateX(${DECK_TILT}deg)`,
            borderRadius: CHASSIS_RADIUS,
          }}
        >
          <Image
            src={DECK}
            alt=""
            width={1273}
            height={853}
            className="h-full w-full select-none object-fill"
            sizes="(max-width: 768px) 70vw, 620px"
            priority
            aria-hidden
          />
        </div>

        <motion.div
          className="absolute left-0 top-0 w-full origin-bottom will-change-transform"
          style={{
            height: PANEL_BAND,
            transformStyle: "preserve-3d",
            borderRadius: CHASSIS_RADIUS,
          }}
          initial={false}
          animate={
            reduced ? undefined : { rotateX: open ? LID_OPEN : LID_CLOSED }
          }
          transition={{ duration: 1.05, ease: EASE }}
        >
          <LidFront
            open={open}
            contentSrc={contentSrc}
            contentAlt={contentAlt}
            hideScreen={hideScreen}
          />

          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              borderRadius: CHASSIS_RADIUS,
            }}
            aria-hidden
          >
            <Image
              src={LID_BACK}
              alt=""
              width={1536}
              height={1024}
              className="h-full w-full select-none object-fill drop-shadow-[0_10px_22px_rgba(0,0,0,0.75)]"
              sizes="(max-width: 768px) 70vw, 620px"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function LidFront({
  open,
  contentSrc,
  contentAlt,
  hideScreen,
}: {
  open: boolean;
  contentSrc?: string;
  contentAlt: string;
  hideScreen?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backfaceVisibility: "hidden", borderRadius: CHASSIS_RADIUS }}
    >
      {/* Bezel texture under the screen art — its screen hole is opaque black,
          so content must paint above it or the UI never shows. */}
      <Image
        src={LID_FRONT}
        alt=""
        width={1536}
        height={1024}
        className="absolute inset-0 z-[1] h-full w-full select-none object-fill"
        sizes="(max-width: 768px) 70vw, 620px"
        priority
        aria-hidden
      />

      <div
        data-product-screen="web"
        className="absolute z-[2] overflow-hidden bg-black"
        style={{
          top: LID_SCREEN.top,
          left: LID_SCREEN.left,
          width: LID_SCREEN.width,
          height: LID_SCREEN.height,
          borderRadius: "1.1%",
        }}
      >
        {contentSrc ? (
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: open && !hideScreen ? 1 : 0 }}
            transition={{ duration: hideScreen ? 0.12 : 0, ease: "easeOut" }}
          >
            <Image
              src={contentSrc}
              alt={contentAlt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 66vw, 580px"
              priority
            />
          </motion.div>
        ) : null}

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0)_34%)]"
          aria-hidden
        />
      </div>
    </div>
  );
}

/**
 * Upright when the product ships mobile, laid flat with a dark screen when it
 * does not. Mobile-only products also step it forward.
 */
function Phone({
  up,
  lead,
  reduced,
  contentSrc,
  contentAlt,
  hideScreen,
}: {
  up: boolean;
  lead: boolean;
  reduced: boolean;
  contentSrc?: string;
  contentAlt: string;
  hideScreen?: boolean;
}) {
  return (
    // containerType makes 1cqw == 1% of the phone's width, which is the only
    // way to express the Z depth responsively (translateZ takes no percentages).
    <div
      className="absolute bottom-[1%] right-[2%] z-[2] w-[16%]"
      style={{ containerType: "inline-size" }}
    >
      {/* Ground contact shadow — stays flat instead of tipping with the body,
          and spreads as the phone lies down. */}
      <motion.div
        className="absolute bottom-0 left-[2%] z-0 w-[96%] rounded-[50%] bg-black blur-md"
        style={{ height: "5%" }}
        initial={false}
        animate={
          reduced
            ? undefined
            : up
              ? { opacity: 0.5, scaleX: 0.8, y: "40%" }
              : { opacity: 0.65, scaleX: 1.15, y: "120%" }
        }
        transition={{ duration: 0.95, ease: EASE }}
        aria-hidden
      />

      <div
        className="relative w-full"
        style={{ perspective: 900, perspectiveOrigin: "50% 100%" }}
      >
        <motion.div
          className="relative w-full origin-bottom will-change-transform"
          style={{
            aspectRatio: `${PHONE_W} / ${PHONE_H}`,
            transformStyle: "preserve-3d",
          }}
          initial={false}
          // Pivot is the group's bottom edge, which the nesting below places at
          // the chassis' BACK bottom edge — so it tips like a solid box.
          animate={
            reduced
              ? undefined
              : up
                ? {
                    rotateX: 0,
                    scale: lead ? 1.3 : 1,
                    x: lead ? "-6%" : "0%",
                    y: lead ? "1%" : "0%",
                  }
                : { rotateX: 72, scale: 0.96, x: "0%", y: "0%" }
          }
          transition={{ duration: 0.95, ease: EASE }}
        >
          {/* Depth plane: carries the geometry only, laid horizontal from the
            pivot so its far edge lands at the chassis' FRONT bottom edge. */}
          <div
            className="absolute bottom-0 left-0 w-full origin-bottom"
            style={{
              aspectRatio: `${1 / PHONE_DEPTH}`,
              transform: "rotateX(-90deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Port detail only — the chassis material comes from the extrusion
              below. Kept inside the flat bottom run so it can never flare. */}
            <div
              className="absolute inset-y-0 left-[19.6%] w-[60.8%]"
              aria-hidden
            >
              <span
                className="absolute left-1/2 top-[34%] h-[30%] w-[20%] -translate-x-1/2 rounded-full bg-[#08080a]"
                style={{ boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.2)" }}
              />
              <span className="absolute left-[18%] top-[45%] h-[11%] w-[4%] rounded-full bg-black/70" />
              <span className="absolute right-[14%] top-[45%] h-[11%] w-[4%] rounded-full bg-black/70" />
              <span className="absolute right-[21%] top-[45%] h-[11%] w-[4%] rounded-full bg-black/70" />
            </div>

            {/* Screen face stands back up from that front edge, so it ends up a
              full chassis depth in front of the pivot. */}
            <div
              className="absolute bottom-full left-0 w-full origin-bottom"
              style={{
                aspectRatio: `${PHONE_W} / ${PHONE_H}`,
                transform: "rotateX(90deg)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Chassis body: the phone's own outline stepped back in Z, so the
                thickness follows the rounded corners exactly. The Z transform
                sits on the wrapper and the tint on the image, because a filter
                would flatten the layer out of its parent's 3D space. */}
              {Array.from({ length: PHONE_LAYERS }, (_, i) => (
                <div
                  key={i}
                  className="absolute inset-0"
                  style={{
                    transform: `translateZ(-${((i + 1) * PHONE_LAYER_STEP).toFixed(3)}cqw)`,
                  }}
                  aria-hidden
                >
                  <Image
                    src={PHONE}
                    alt=""
                    width={PHONE_W}
                    height={PHONE_H}
                    className="h-full w-full select-none"
                    style={{
                      filter: `brightness(${(0.5 - (i / PHONE_LAYERS) * 0.3).toFixed(3)})`,
                    }}
                    sizes="(max-width: 768px) 22vw, 150px"
                  />
                </div>
              ))}

              <motion.div
                className="relative h-full w-full"
                initial={false}
                animate={{ filter: up ? "brightness(1)" : "brightness(0.5)" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* No drop-shadow here: it renders inside the tipped plane and
                  smears with it. Ground contact shadow lives outside instead. */}
                <Image
                  src={PHONE}
                  alt=""
                  width={PHONE_W}
                  height={PHONE_H}
                  className="absolute inset-0 z-[1] h-full w-full select-none"
                  sizes="(max-width: 768px) 22vw, 150px"
                  priority
                  aria-hidden
                />

                <div
                  data-product-screen="mobile"
                  className="absolute z-[2] overflow-hidden bg-black"
                  style={{
                    top: PHONE_SCREEN.top,
                    left: PHONE_SCREEN.left,
                    width: PHONE_SCREEN.width,
                    height: PHONE_SCREEN.height,
                    borderRadius: PHONE_SCREEN.radius,
                  }}
                >
                  {contentSrc ? (
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{ opacity: up && !hideScreen ? 1 : 0 }}
                      transition={{
                        duration: hideScreen ? 0.12 : 0,
                        ease: "easeOut",
                      }}
                    >
                      <Image
                        src={contentSrc}
                        alt={contentAlt}
                        fill
                        className="object-contain object-top"
                        sizes="(max-width: 768px) 22vw, 150px"
                        priority
                      />
                    </motion.div>
                  ) : null}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
