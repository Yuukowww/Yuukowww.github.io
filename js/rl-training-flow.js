// Keep the training cycle in the layout used by the article's reference diagram.
export function layoutRLTrainingFlow(svg) {
  if (svg.dataset.rlLayout || !svg.querySelector(".rlTraining")) return;

  const ids = ["A", "B", "C", "D", "E", "F", "G"];
  const nodes = Object.fromEntries(ids.map((id) => {
    const element = svg.querySelector(`.rlTraining[id^="flowchart-${id}-"]`);
    const rect = element?.querySelector("rect");
    return [id, rect && {
      element, rect,
      width: Number(rect.getAttribute("width")) + 60,
      height: Math.max(76, Number(rect.getAttribute("height")) + 12)
    }];
  }));
  const pairs = ["DE", "EF", "FA", "AB", "BC", "CD", "EG"];
  const edges = Object.fromEntries(pairs.map(([from, to]) => [
    from + to, svg.querySelector(`.flowchart-link.LS-${from}.LE-${to}`)
  ]));
  if (ids.some((id) => !nodes[id]) || pairs.some((pair) => !edges[pair])) return;

  const left = nodes.C.width / 2 + 53;
  nodes.F.x = nodes.A.x = nodes.B.x = left;
  nodes.C.x = left - 45;
  nodes.D.x = left + 200;
  nodes.E.x = left + 243;
  nodes.G.x = left + 296;
  let bottom = 8;
  for (const id of ["D", "E", "F", "A", "B", "C"]) {
    const node = nodes[id];
    node.y = bottom + node.height / 2;
    bottom += node.height + 50;
  }
  nodes.G.y = nodes.A.y;
  for (const node of Object.values(nodes)) {
    node.top = node.y - node.height / 2;
    node.bottom = node.y + node.height / 2;
    node.element.setAttribute("transform", `translate(${node.x},${node.y})`);
    for (const [key, value] of Object.entries({
      x: -node.width / 2, y: -node.height / 2,
      width: node.width, height: node.height
    })) node.rect.setAttribute(key, value);
  }

  const { A, B, C, D, E, F, G } = nodes;
  const paths = {
    DE: [[E.x, D.bottom], [E.x, E.top]],
    EF: [[E.x - 54, E.bottom], [E.x - 54, E.bottom + 25],
      [F.x, E.bottom + 25], [F.x, F.top]],
    FA: [[F.x, F.bottom], [A.x, A.top]],
    AB: [[A.x, A.bottom], [B.x, B.top]],
    BC: [[B.x, B.bottom], [B.x, C.top]],
    CD: [[C.x - 48, C.top], [C.x - 48, C.top - 24],
      [36, C.top - 24], [36, D.bottom + 24],
      [D.x - 43, D.bottom + 24], [D.x - 43, D.bottom]],
    EG: [[G.x, E.bottom], [G.x, G.top]]
  };

  const ns = "http://www.w3.org/2000/svg";
  const marker = document.createElementNS(ns, "marker");
  marker.id = `${svg.id}-rl-arrow`;
  for (const [key, value] of Object.entries({
    viewBox: "0 0 8 10", refX: 6, refY: 5,
    markerWidth: 8, markerHeight: 10,
    markerUnits: "userSpaceOnUse", orient: "auto"
  })) marker.setAttribute(key, value);
  const arrow = document.createElementNS(ns, "path");
  arrow.setAttribute("d", "M1,1 L6,5 L1,9");
  arrow.setAttribute("style", "fill:none;stroke:#909090;stroke-width:1.2px");
  marker.appendChild(arrow);
  const defs = document.createElementNS(ns, "defs");
  defs.appendChild(marker);
  svg.prepend(defs);
  for (const [pair, points] of Object.entries(paths)) {
    const edge = edges[pair];
    edge.setAttribute("d", roundedPath(points));
    edge.removeAttribute("marker-start");
    edge.setAttribute("marker-end", `url(#${marker.id})`);
    edge.style.stroke = "#909090";
    edge.style.strokeWidth = "1.2px";
    if (pair === "EG") edge.style.strokeDasharray = "3 3";
  }

  const label = Array.from(svg.querySelectorAll("g.edgeLabel"))
    .find((element) => element.textContent.trim() === "定期进行");
  if (label) label.setAttribute("transform", `translate(${G.x},${(E.bottom + G.top) / 2})`);
  const right = Math.max(...Object.values(nodes).map((node) => node.x + node.width / 2));
  svg.setAttribute("viewBox", `0 0 ${right + 8} ${C.bottom + 8}`);
  svg.dataset.rlLayout = "true";
}

function roundedPath(points) {
  let path = `M${points[0].join(",")}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [px, py] = points[i - 1];
    const [nx, ny] = points[i + 1];
    const radius = Math.min(8, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2);
    path += ` L${x - Math.sign(x - px) * radius},${y - Math.sign(y - py) * radius}`;
    path += ` Q${x},${y} ${x + Math.sign(nx - x) * radius},${y + Math.sign(ny - y) * radius}`;
  }
  return `${path} L${points.at(-1).join(",")}`;
}
