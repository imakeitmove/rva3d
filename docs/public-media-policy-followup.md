# Separate publication-policy follow-up

This issue must not block the protected Preview recovery, and recovery does not authorize history rewriting.

The existing public Git history contains these files despite their registration as private-review-only:

- public/media/capabilities/five-below-zig-zag-display-loop.mp4
- public/media/capabilities/five-below-zig-zag-display-poster.webp
- public/media/capabilities/desmi-chocolate-pump-loop.mp4
- public/media/capabilities/desmi-chocolate-pump-poster.webp
- public/models/RVA_Logo_010_intro_001.glb

Recommended decision sequence:

1. Confirm publication rights with the owner. If public distribution is authorized, explicitly reconcile the registration policy rather than treating an accidental commit as approval.
2. Otherwise, preserve source masters outside the public repository. With separate approval, remove the delivery originals from the current tracked tree without deleting masters and add precise ignore rules.
3. Current-tree removal does not remove older public Git blobs, forks, clones, or caches. Decide separately whether coordinated history cleanup and host-side cache removal are warranted; obtain explicit approval before any rewrite or force push. Do not promise complete erasure.
4. Keep manifest-selected delivery copies behind the authenticated media route. Do not publish a private-media archive or put it in Git/Git LFS as a workaround.

Recovery leaves these existing files/history unchanged. The prepared protected package excludes public/media, public/models, and public/project-media and contains only the 90 selected private delivery files in private-media/.
