const [duration, func] = createSpring({
  mass: 1.75,
  stiffness: 400,
  damping: 16.7,
  velocity: 0,
});

/*
  Export your easing function as a global.
  The name you use here will appear in the output.
  The easing function must take a number as input,
  where 0 is the start, and 1 is the end.
  It must return the 'eased' value.
*/
self.spring = func;
/*
  Some easings have an ideal duration, like this one.
  You can export it to the global, in milliseconds,
  and it will be used in the output.
  This is optional.
*/
self.duration = duration;

function createSpring({ mass, stiffness, damping, velocity }) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    if (zeta < 1) {
      t =
        Math.exp(-t * zeta * w0) *
        (1 * Math.cos(wd * t) + b * Math.sin(wd * t));
    } else {
      t = (1 + b * t) * Math.exp(-t * w0);
    }

    return 1 - t;
  }

  const duration = (() => {
    const step = 1 / 6;
    let time = 0;

    while (true) {
      if (Math.abs(1 - solver(time)) < 0.001) {
        const restStart = time;
        let restSteps = 1;
        while (true) {
          time += step;
          if (Math.abs(1 - solver(time)) >= 0.001) break;
          restSteps++;
          if (restSteps === 16) return restStart;
        }
      }
      time += step;
    }
  })();

  return [duration * 1000, (t) => solver(duration * t)];
}

//
const start = performance.now();

function tick(now) {
  const t = Math.min((now - start) / duration, 1);
  const easedT = func(t);

  element.style.transform = `translateX(${easedT * 100}px)`;

  if (t < 1) requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
