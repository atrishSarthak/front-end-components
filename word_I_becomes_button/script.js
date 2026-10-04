import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const spotlightHeaders = document.querySelectorAll(".spotlight-header");

const frontHeader = spotlightHeaders[spotlightHeaders.length - 1];
const frontSvg = frontHeader.querySelector("svg");
const letterIPath = frontSvg.querySelectorAll("path")[2];

const letterIGroup = document.createElementNS(SVG_NAMESPACE, "g");
letterIPath.parentNode.insertBefore(letterIGroup, letterIPath);
letterIGroup.appendChild(letterIPath);

gsap.set(letterIGroup, { transformOrigin: "center center" });

const letterIBounds = letterIPath.getBBox();
const letterICenterX = letterIBounds.x + letterIBounds.width / 2;
const letterICenterY = letterIBounds.y + letterIBounds.height / 2;

const labelText = "Contact Us";

const labelElement = document.createElementNS(SVG_NAMESPACE, "text");
labelElement.setAttribute("class", "i-link-text");
labelElement.setAttribute("x", letterICenterX);
labelElement.setAttribute("y", letterICenterY);
labelElement.setAttribute(
  "transform",
  `rotate(-90 ${letterICenterX} ${letterICenterY})`,
);
labelElement.textContent = "";
letterIGroup.appendChild(labelElement);

const labelRevealTween = gsap.to(labelElement, {
  duration: 0.75,
  scrambleText: {
    text: labelText.toUpperCase(),
    chars: "upperCase",
    revealDelay: 0.1,
    speed: 0.5,
  },
  paused: true,
});

let isLabelRevealed = false;

let isMobileViewport = window.innerWidth < 1000;
let letterISlideDistance = isMobileViewport ? 10000 : 2500;
let letterITargetScale = isMobileViewport ? 3 : 1;
let cascadeShiftStep = isMobileViewport ? 25 : 5;

window.addEventListener("resize", () => {
  isMobileViewport = window.innerWidth < 1000;
  letterISlideDistance = isMobileViewport ? 5000 : 2500;
  letterITargetScale = isMobileViewport ? 1.6 : 1;
  cascadeShiftStep = isMobileViewport ? 20 : 5;
  ScrollTrigger.refresh();
});

ScrollTrigger.create({
  trigger: ".spotlight",
  start: "top 70%",
  end: "bottom 70%",
  scrub: true,

  onUpdate: (self) => {
    const scrollProgress = self.progress;

    const cascadeProgress = Math.min(scrollProgress / 0.5, 1);

    spotlightHeaders.forEach((header, index) => {
      const finalScale = 1 - index * 0.075;
      const scale = 1 + (finalScale - 1) * cascadeProgress;
      const y = index * cascadeShiftStep * cascadeProgress;

      gsap.set(header, { scale, y });
    });

    const letterIProgress = gsap.utils.clamp(
      0,
      1,
      (scrollProgress - 0.5) / 0.5,
    );

    gsap.set(letterIGroup, {
      rotation: gsap.utils.interpolate(0, 90, letterIProgress),
      y: gsap.utils.interpolate(0, letterISlideDistance, letterIProgress),
      scale: gsap.utils.interpolate(1, letterITargetScale, letterIProgress),
    });

    if (scrollProgress > 0.75 && !isLabelRevealed) {
      isLabelRevealed = true;
      labelRevealTween.play();
    } else if (scrollProgress < 0.75 && isLabelRevealed) {
      isLabelRevealed = false;
      labelRevealTween.reverse();
    }
  },
});