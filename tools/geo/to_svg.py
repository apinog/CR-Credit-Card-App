#!/usr/bin/env python3
"""Convert Costa Rica province GeoJSON (MultiPolygon) to simplified SVG paths.

Projection: equirectangular with cos(mean_lat) x-scale correction, then fit to viewBox.
Simplification: Douglas-Peucker in projected space.
Output: JS module with { id, name, d } entries.
"""
import json, math

PROVINCES = {
    "1": ("san-jose", "San José"),
    "2": ("alajuela", "Alajuela"),
    "3": ("cartago", "Cartago"),
    "4": ("heredia", "Heredia"),
    "5": ("guanacaste", "Guanacaste"),
    "6": ("puntarenas", "Puntarenas"),
    "7": ("limon", "Limón"),
}

VIEW_W, VIEW_H, PAD = 1000, 1000, 8  # height adjusted after fit
TOL = 1.1          # Douglas-Peucker tolerance in viewBox units
MIN_RING_AREA = 18 # drop tiny islets below this projected area (viewBox units^2)

def load():
    provs = {}
    all_pts = []
    for code, (pid, name) in PROVINCES.items():
        g = json.load(open(f"geo/{code}.geojson"))["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        provs[pid] = (name, polys)
        for poly in polys:
            for ring in poly:
                all_pts.extend(ring)
    return provs, all_pts

def project_factory(all_pts):
    lons = [p[0] for p in all_pts]; lats = [p[1] for p in all_pts]
    lon0, lon1 = min(lons), max(lons)
    lat0, lat1 = min(lats), max(lats)
    k = math.cos(math.radians((lat0 + lat1) / 2))
    w = (lon1 - lon0) * k
    h = (lat1 - lat0)
    s = (VIEW_W - 2 * PAD) / w
    view_h = h * s + 2 * PAD
    def proj(pt):
        x = (pt[0] - lon0) * k * s + PAD
        y = (lat1 - pt[1]) * s + PAD
        return (x, y)
    return proj, VIEW_W, view_h

def dp(points, tol):
    """Iterative Douglas-Peucker."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        i0, i1 = stack.pop()
        x0, y0 = points[i0]; x1, y1 = points[i1]
        dx, dy = x1 - x0, y1 - y0
        seg2 = dx * dx + dy * dy
        dmax, imax = -1.0, -1
        for i in range(i0 + 1, i1):
            px, py = points[i]
            if seg2 == 0:
                d = math.hypot(px - x0, py - y0)
            else:
                t = ((px - x0) * dx + (py - y0) * dy) / seg2
                t = max(0.0, min(1.0, t))
                d = math.hypot(px - (x0 + t * dx), py - (y0 + t * dy))
            if d > dmax:
                dmax, imax = d, i
        if dmax > tol:
            keep[imax] = True
            stack.append((i0, imax)); stack.append((imax, i1))
    return [p for p, k in zip(points, keep) if k]

def ring_area(pts):
    a = 0.0
    for i in range(len(pts) - 1):
        a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]
    return abs(a) / 2

def fmt(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")

def main():
    provs, all_pts = load()
    proj, vw, vh = project_factory(all_pts)
    out = []
    total = 0
    for pid, (name, polys) in provs.items():
        parts = []
        for poly in polys:
            for ring in poly:  # includes holes; CR provinces have none of note
                pts = [proj(p) for p in ring]
                if ring_area(pts) < MIN_RING_AREA:
                    continue
                simp = dp(pts, TOL)
                if len(simp) < 4:
                    continue
                d = "M" + "L".join(f"{fmt(x)} {fmt(y)}" for x, y in simp[:-1]) + "Z"
                parts.append(d)
                total += len(simp)
        out.append({"id": pid, "name": name, "d": "".join(parts)})
    js_obj = {"viewBox": f"0 0 {fmt(vw)} {fmt(vh)}", "provinces": out}
    with open("geo/cr_map_paths.json", "w") as f:
        json.dump(js_obj, f, ensure_ascii=False)
    print(f"viewBox: 0 0 {fmt(vw)} {fmt(vh)} | total points: {total}")
    size = sum(len(p["d"]) for p in out)
    print(f"path data size: {size/1024:.1f} KB")

if __name__ == "__main__":
    main()
