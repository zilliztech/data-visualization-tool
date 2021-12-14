import React, { useEffect, useEffect, useState } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { useClientRect } from "Hooks";
import { ILevel, NodeType, LinkType } from "Types";
import * as d3 from "d3";

const HNSWForceOne = observer(() => {
  const store = useGlobalStore();
  const { visData, searchStatus } = store;
  const svgId = "hnsw_all_in_one_svg";
  const { width, height } = useClientRect({ svgId });
  const forceWidth = width;
  const forceHeight = visData.length > 0 ? height : height / visData.length;

  const { transform, levelMapCoords } = useTransform({
    width,
    height,
    forceWidth,
    forceHeight,
    visData,
    searchStatus,
  });

  return (
    <svg
      id={svgId}
      width="100%"
      height="100%"
      style={{ backgroundColor: "#000" }}
    >
      {visData.map((_, level) => (
        <g key={level} id={`level-${level}`}>
          {levelMapCoords[level].length > 0 && (
            <path
              id="border"
              d={`M${levelMapCoords[level]
                .map((coord) => `${coord}`)
                .join("L")}Z`}
              fill="#fff"
              opacity="0.2"
            />
          )}
        </g>
      ))}
    </svg>
  );
});

export default HNSWForceOne;

const useNodeCoordMap = ({
  width,
  height,
  visData,
  searchStatus,
  computeTime = 3000,
}: {
  width: number;
  height: number;
  visData: ILevel[];
  searchStatus: string;
  computeTime?: number;
}) => {
  const [nodeCoordMap, setNodeCoordMap] = useState<{ [key: string]: TCoord }>(
    {}
  );
  const [layoutFinished, setLayoutFinished] = useState(false);
  const [computeTimer, setComputeTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    setLayoutFinished(false);
    computeTimer && clearTimeout(computeTimer);
    if (width > 0 && height > 0 && searchStatus === "ok") {
      const nodeId2dist = {} as { [key: string]: number };
      visData.forEach((levelData) => {
        levelData.nodes.forEach((node) => {
          nodeId2dist[node.id] = node.dist || 0;
        });
      });
      const nodeIds = Object.keys(nodeId2dist);
      const nodes = nodeIds.map((nodeId) => ({
        index: nodeId,
        dist: nodeId2dist[nodeId],
      }));

      const linkStrings = new Set();
      const links = [];
      // de-duplicate
      visData.forEach((levelData) => {
        levelData.links.forEach((link) => {
          if (
            `${link.source}---${link.target}` in linkStrings ||
            `${link.target}---${link.source}` in linkStrings
          ) {
            console.log("link existed", link);
          } else {
            linkStrings.add(`${link.source}---${link.target}`);
            links.push(link);
          }
        });
      });

      
    }
  }, [width, height, visData, searchStatus]);

  return {nodeCoordMap, layoutFinished}
};

const useTransform = ({
  width,
  height,
  forceWidth,
  forceHeight,
  visData,
  searchStatus,
  xBias = 0.7,
  yBias = 0.7,
  yOver = 0.3,
  padding = [30, 20],
}: {
  width: number;
  height: number;
  forceWidth: number;
  forceHeight: number;
  visData: ILevel[];
  searchStatus: string;
  xBias?: number;
  yBias?: number;
  yOver?: number;
  padding?: TCoord;
}) => {
  let levelMapCoords = visData.map((_) => []) as TCoord[][];
  let transform = ([x, y]: TCoord, level: number) => [0, 0] as TCoord;
  if (width > 0 && height > 0 && searchStatus === "ok") {
    const levelCount = visData.length;
    const levelHeight =
      (height - padding[1] * 2) / (levelCount - (levelCount - 1) * yOver);
    transform = ([x, y]: TCoord, level: number) => {
      const _x = x / forceWidth;
      const _y = y / forceHeight;

      const newX =
        padding[0] +
        (width - padding[0] * 2) * xBias +
        _x * (width - padding[0] * 2) * (1 - xBias) -
        _y * (width - padding[0] * 2) * xBias;
      const newY =
        padding[1] +
        levelHeight * (1 - yOver) * level +
        _x * levelHeight * (1 - yBias) +
        _y * levelHeight * yBias;
      return [newX, newY] as TCoord;
    };

    levelMapCoords = visData.map((_, i) =>
      [
        [0, 0],
        [forceWidth, 0],
        [forceWidth, forceHeight],
        [0, forceHeight],
      ].map((coord) => transform(coord as TCoord, i))
    );
  }
  return { transform, levelMapCoords };
};

export type TCoord = [number, number];