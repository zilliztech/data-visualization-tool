import * as d3 from "d3";

export const getStarPath = (x: number, y: number, width: number) => {
  x = x - width / 2;
  y = y - width / 2 / Math.tan((72 / 180) * Math.PI);
  const coordB = {
    x0: x + width,
    y0: y,
  };
  const coordD = {
    x0:
      x +
      width * Math.sin((36 / 180) * Math.PI) * Math.tan((18 / 180) * Math.PI),
    y0: y + width * Math.sin((36 / 180) * Math.PI),
  };
  const coordA = {
    x0: x + width / 2,
    y0: y - (width / 2) * Math.tan((36 / 180) * Math.PI),
  };
  const coordC = {
    x0: x + width * Math.cos((36 / 180) * Math.PI),
    y0: y + width * Math.sin((36 / 180) * Math.PI),
  };
  //绘制星星
  return `M${x},${y} L${coordB.x0},${coordB.y0} L${coordD.x0},${coordD.y0} L${coordA.x0},${coordA.y0} L${coordC.x0},${coordC.y0} Z`;
};

export const getPolygon = (x: number, y: number, r: number, n: number) => {
  const stepAngle = (2 * Math.PI) / n;
  const points = d3
    .range(n)
    .map(
      (i) =>
        `${x + r * Math.sin(stepAngle * i)},${y - r * Math.cos(stepAngle * i)}`
    );
  return `M${points.join("L")}`;
};

interface IVecComp {
  x: number;
  y: number;
}

export const vecCmp = (vecs: IVecComp[], key: string) => {
  const center = {
    x: vecs.reduce((s, a) => s + a.x, 0) / vecs.length,
    y: vecs.reduce((s, a) => s + a.y, 0) / vecs.length,
  };
  vecs.sort((a: IVecComp, b: IVecComp) => {
    if (a.x >= center.x && b.x < center.x) {
      return 1;
    }
    if (a.x === center.x && b.x === center.x) {
      return a.y > b.y ? 1 : -1;
    }
    const det =
      (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
    return det > 0 ? 1 : -1;
  });
  const res = vecs.map((vec) => (vec as any)[key]);
  res.reverse();
  return res;
};
