export function calculateTextWidth(text: string, className: string): number {
  const div = document.createElement("div");
  div.className = className;
  div.innerText = text;
  div.style.position = "absolute";
  div.style.width = "max-content";
  div.style.whiteSpace = "nowrap";
  div.style.visibility = "hidden";
  document.body.appendChild(div);
  const width = div.offsetWidth;
  document.body.removeChild(div);
  return width;
}
