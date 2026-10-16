<!-- AI-CONTEXT-BEGIN -->
Purpose: record the owner-supplied drawing used in the approved design. Preserve the drawing and colours. Do not attribute it to an artist or school without confirmation. The owner requested a cropped version of their PDF. The owner approved publication on October 16, 2026.
<!-- AI-CONTEXT-END -->
# Durga drawing

Asset: `assets/durga-original-crop.png`.

Source: owner-supplied `Om_Durga_2.pdf`, one page. Source PDF remains unchanged. No artist attribution was supplied.

Rendered with Poppler on October 16, 2026 at 144 DPI. Crop coordinates in rendered pixels: x=5, y=75, width=890, height=1075. The crop reduces surrounding orange space while preserving the figures. It does not redraw or recolour the artwork.

Reproduce with:

```sh
pdftoppm -f 1 -singlefile -r 144 -x 5 -y 75 -W 890 -H 1075 -png /path/to/Om_Durga_2.pdf assets/durga-original-crop
```

The website displays the image inside a lightly rounded rectangular frame to avoid clipping the drawing's edge details. The owner approved this artwork and design for publication on October 16, 2026.

## Circular logo emblem

`assets/glam-cycle-emblem.svg` derives from the owner-supplied original logo PNG. Its SVG filter isolates the gold ornament while preserving source transparency; its transformation reflects the semicircle into a full circle. No lettering appears in the emblem. CSS renders it in white on red surfaces. The footer retains the complete lettered logo.
