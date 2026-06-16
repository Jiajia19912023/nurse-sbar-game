import argparse, shutil
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

def is_whiteish(rgb, tolerance):
    return np.all(rgb >= 255 - tolerance, axis=-1)

def flood_fill_from_edges(white_mask):
    labeled, _ = ndimage.label(white_mask)
    edge_labels = set()
    edge_labels.update(labeled[0, :].tolist())
    edge_labels.update(labeled[-1, :].tolist())
    edge_labels.update(labeled[:, 0].tolist())
    edge_labels.update(labeled[:, -1].tolist())
    edge_labels.discard(0)
    return np.isin(labeled, list(edge_labels))

def process(path, tolerance=15, include_enclosed=False, feather=1):
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    white = is_whiteish(arr[:,:,:3], tolerance)
    target = white if include_enclosed else flood_fill_from_edges(white)
    alpha = arr[:,:,3].copy()
    alpha[target] = 0
    if feather > 0:
        alpha = ndimage.gaussian_filter(alpha.astype(np.float32), sigma=feather).astype(np.uint8)
    arr[:,:,3] = alpha
    backup = path.with_suffix(".orig" + path.suffix)
    if not backup.exists():
        shutil.copy2(path, backup)
    Image.fromarray(arr).save(path)
    print(f"Done: {path.name}")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("paths", nargs="+", type=Path)
    p.add_argument("--tolerance", type=int, default=15)
    p.add_argument("--include-enclosed", action="store_true")
    p.add_argument("--feather", type=int, default=1)
    args = p.parse_args()
    for path in args.paths:
        process(path, args.tolerance, args.include_enclosed, args.feather)
