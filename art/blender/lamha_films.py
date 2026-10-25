"""
LAMHA film production: original looping films rendered in Blender (Cycles) from the brand's own
sculptural vocabulary — the angular L-module and the diamond node (logo guidelines 02, used as
illustration modules, never as a rebuilt logo).

Every film is code: geometry, materials, light, choreography and camera are generated here, so a
film can be re-rendered at another size or length without manual scene work.

Usage (Blender 5.x):
  blender -b --factory-startup -P art/blender/lamha_films.py -- --film assembly --out <dir>
          [--res 1280x720] [--fps 30] [--samples 64] [--still 0.4] [--frames N]

Writes <out>/<film>/####.png (or a single <film>-still.png with --still t). Encoding to MP4/WebM
and poster extraction is done by art/encode_films.py.
"""

import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Euler, Matrix, Quaternion, Vector

# ----------------------------------------------------------------------------------------------
# Arguments
# ----------------------------------------------------------------------------------------------


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    opts = {"film": "assembly", "out": "films", "res": "1280x720", "fps": "30", "samples": "64", "still": None, "frames": None, "only": None, "blur": "1"}
    i = 0
    while i < len(argv):
        key = argv[i].lstrip("-")
        opts[key] = argv[i + 1]
        i += 2
    w, h = (int(v) for v in opts["res"].split("x"))
    return {
        "film": opts["film"],
        "out": opts["out"],
        "w": w,
        "h": h,
        "fps": int(opts["fps"]),
        "samples": int(opts["samples"]),
        "still": None if opts["still"] is None else float(opts["still"]),
        "frames": None if opts["frames"] is None else int(opts["frames"]),
        # Re-render selected frames only, e.g. "99-101,200".
        "only": opts["only"],
        # --blur 0: no motion blur (frames where a loop re-indexes objects, e.g. the endless stair).
        "blur": opts["blur"] != "0",
    }


# ----------------------------------------------------------------------------------------------
# Palette (brand guidelines 05). Converted to linear for shading.
# ----------------------------------------------------------------------------------------------


def srgb(hexstr, a=1.0):
    hexstr = hexstr.lstrip("#")
    c = [int(hexstr[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (lin[0], lin[1], lin[2], a)


NAVY = "#0B1B3A"
BLUE = "#1769E0"
BLUE2 = "#2E7CF6"
CLOUD = "#F5F8FC"
INK = "#162033"

# ----------------------------------------------------------------------------------------------
# Geometry
# ----------------------------------------------------------------------------------------------

# L outline from the brand device (same proportions as src/components/three/brand-geometry.ts).
L_OUTLINE = [(0, 0), (0.72, 0), (0.72, 0.24), (0.36, 0.24), (0.24, 0.36), (0.24, 1.0), (0, 1.0)]


def _bevelled_mesh(name, build, width, segments):
    bm = bmesh.new()
    build(bm)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name + "_raw")
    bm.to_mesh(me)
    bm.free()
    tmp = bpy.data.objects.new(name + "_tmp", me)
    bpy.context.scene.collection.objects.link(tmp)
    mod = tmp.modifiers.new("bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(30)
    mod.harden_normals = True
    mod.profile = 0.6
    dg = bpy.context.evaluated_depsgraph_get()
    final = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    final.name = name
    for p in final.polygons:
        p.use_smooth = True
    bpy.data.objects.remove(tmp)
    bpy.data.meshes.remove(me)
    return final


def l_module_mesh(depth=0.22):
    cx, cy = 0.36, 0.5

    def build(bm):
        verts = [bm.verts.new((x - cx, y - cy, -depth / 2)) for x, y in L_OUTLINE]
        face = bm.faces.new(verts)
        ext = bmesh.ops.extrude_face_region(bm, geom=[face])
        top = [g for g in ext["geom"] if isinstance(g, bmesh.types.BMVert)]
        bmesh.ops.translate(bm, verts=top, vec=(0, 0, depth))

    return _bevelled_mesh("LModule", build, 0.034, 5)


def node_mesh(size=0.14, flat=0.55):
    def build(bm):
        v = [
            bm.verts.new((size, 0, 0)),
            bm.verts.new((0, size, 0)),
            bm.verts.new((-size, 0, 0)),
            bm.verts.new((0, -size, 0)),
            bm.verts.new((0, 0, size * flat)),
            bm.verts.new((0, 0, -size * flat)),
        ]
        for a, b in ((0, 1), (1, 2), (2, 3), (3, 0)):
            bm.faces.new((v[a], v[b], v[4]))
            bm.faces.new((v[b], v[a], v[5]))

    return _bevelled_mesh("Node", build, 0.012, 2)


def slab_mesh(w, h, d, name="Slab"):
    def build(bm):
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts:
            v.co.x *= w
            v.co.y *= h
            v.co.z *= d

    return _bevelled_mesh(name, build, min(w, h, d) * 0.12, 4)


# ----------------------------------------------------------------------------------------------
# Materials
# ----------------------------------------------------------------------------------------------


def principled(name, color, rough, coat=0.0, coat_rough=0.05, sheen=0.0, sheen_tint=(1, 1, 1, 1), metal=0.0, emission=None, emission_strength=0.0, transmission=0.0, ior=1.45, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = coat_rough
    b.inputs["Sheen Weight"].default_value = sheen
    b.inputs["Sheen Tint"].default_value = sheen_tint
    b.inputs["Specular IOR Level"].default_value = spec
    b.inputs["Transmission Weight"].default_value = transmission
    b.inputs["IOR"].default_value = ior
    if emission is not None:
        b.inputs["Emission Color"].default_value = emission
        b.inputs["Emission Strength"].default_value = emission_strength
    return m


def materials():
    return {
        "navy": principled("Navy enamel", srgb(NAVY), 0.16, coat=1.0, coat_rough=0.035),
        "ceramic": principled("Ceramic", srgb("#F1F4F9"), 0.32, coat=0.6, coat_rough=0.12, sheen=0.25, sheen_tint=srgb("#dfe8f7")),
        "velvet": principled("Blue velvet", srgb(BLUE), 0.55, sheen=1.0, sheen_tint=srgb("#8fb8ff")),
        "gloss_blue": principled("Gloss blue", srgb(BLUE2), 0.14, coat=1.0, coat_rough=0.03),
        "node": principled("Node", srgb(BLUE2), 0.25, coat=0.3, emission=srgb(BLUE2), emission_strength=4.0),
        "node_white": principled("Node white", srgb("#ffffff"), 0.2, emission=srgb("#ffffff"), emission_strength=3.0),
        "glass": principled("Glass", srgb("#e8f0ff"), 0.04, transmission=1.0, ior=1.45),
        "graphite": principled("Graphite", srgb("#1b2232"), 0.42, coat=0.4, coat_rough=0.2),
    }


# ----------------------------------------------------------------------------------------------
# Studio
# ----------------------------------------------------------------------------------------------


def setup_render(o):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("OPTIX", "CUDA"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            if any(d.type == kind for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == kind
                break
        except Exception:
            continue
    sc.cycles.device = "GPU"
    sc.cycles.samples = o["samples"]
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.cycles.transmission_bounces = 8
    sc.cycles.glossy_bounces = 4
    sc.cycles.diffuse_bounces = 3
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.render.resolution_x = o["w"]
    sc.render.resolution_y = o["h"]
    sc.render.resolution_percentage = 100
    sc.render.fps = o["fps"]
    sc.render.use_persistent_data = True
    sc.render.use_motion_blur = o["blur"]
    sc.render.motion_blur_shutter = 0.45
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.render.image_settings.color_depth = "8"
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.film_transparent = False


def world(color_hex, strength=1.0):
    w = bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = srgb(color_hex)
    bg.inputs["Strength"].default_value = strength


def area_light(name, loc, look_at, size, energy, color="#ffffff", shape="RECTANGLE", size_y=None):
    d = bpy.data.lights.new(name, "AREA")
    d.shape = shape
    d.size = size
    if size_y is not None:
        d.size_y = size_y
    d.energy = energy
    d.color = srgb(color)[:3]
    ob = bpy.data.objects.new(name, d)
    bpy.context.scene.collection.objects.link(ob)
    ob.visible_camera = False
    ob.location = loc
    direction = Vector(look_at) - Vector(loc)
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return ob


def backdrop(color_hex, rough=0.6, y=-3.0, radius=6.0, name="Cyc"):
    """Seamless cyclorama: a floor that curves up into a back wall (no visible horizon)."""
    mat = principled(name + " mat", srgb(color_hex), rough, spec=0.3)
    bm = bmesh.new()
    seg = 24
    width = 60.0
    # Y is up and the camera looks down -Z: the floor runs from z=+30 to z=-4, then arcs up into a back wall.
    pts = [(y, 30.0)]
    for i in range(seg + 1):
        a = (math.pi / 2) * i / seg
        pts.append((y + radius - radius * math.cos(a), -radius * math.sin(a) - 4.0))
    pts.append((y + 40.0, -radius - 4.0))
    rows = []
    for yy, zz in pts:
        rows.append([bm.verts.new((-width / 2, yy, zz)), bm.verts.new((width / 2, yy, zz))])
    for i in range(len(rows) - 1):
        a, b = rows[i]
        c, d = rows[i + 1]
        bm.faces.new((a, b, d, c))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(mat)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def camera(lens=50, fstop=None):
    cd = bpy.data.cameras.new("Camera")
    cd.lens = lens
    cd.sensor_width = 36
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
    cam = bpy.data.objects.new("Camera", cd)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    return cam


def aim(ob, target):
    direction = Vector(target) - ob.location
    # Compatible with the previous key, so a wrap of 2π never reads as a full spin under motion blur.
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler("XYZ", ob.rotation_euler)


# ----------------------------------------------------------------------------------------------
# Choreography helpers
# ----------------------------------------------------------------------------------------------


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * x * (x * (x * 6 - 15) + 10)


def back_out(x, s=1.4):
    x = max(0.0, min(1.0, x))
    x -= 1
    return x * x * ((s + 1) * x + s) + 1


def window(t, a, b):
    """0 before a, 1 after b, smooth in between (t, a, b in loop time 0..1)."""
    if b <= a:
        return 1.0 if t >= a else 0.0
    return smooth((t - a) / (b - a))


def q_from_euler(x, y, z):
    return Euler((x, y, z)).to_quaternion()


def mix_tf(a, b, k):
    """Blend two transforms (loc Vector, rot Quaternion, scale float)."""
    # Position may overshoot (back-out easing); rotation is clamped because slerp cannot extrapolate.
    return (a[0].lerp(b[0], k), a[1].slerp(b[1], max(0.0, min(1.0, k))), a[2] + (b[2] - a[2]) * k)


def instance(mesh, mat, name):
    # One shared mesh, object-level material slot, so every module can carry its own finish.
    if len(mesh.materials) == 0:
        mesh.materials.append(None)
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(ob)
    ob.rotation_mode = "QUATERNION"
    ob.material_slots[0].link = "OBJECT"
    ob.material_slots[0].material = mat
    return ob


_last_q = {}


def key(ob, frame, tf):
    loc, rot, sc = tf
    # q and -q are the same rotation, but keyframes interpolate components: keep consecutive keys on the
    # same hemisphere so motion blur never sweeps through the long way round.
    rot = rot.copy()
    prev = _last_q.get(ob.name)
    if prev is not None and prev.dot(rot) < 0:
        rot.negate()
    _last_q[ob.name] = rot.copy()
    ob.location = loc
    ob.rotation_quaternion = rot
    ob.scale = (sc, sc, sc)
    ob.keyframe_insert("location", frame=frame)
    ob.keyframe_insert("rotation_quaternion", frame=frame)
    ob.keyframe_insert("scale", frame=frame)


def linearize(obs):
    for ob in obs:
        ad = ob.animation_data
        if not ad or not ad.action:
            continue
        for layer in getattr(ad.action, "layers", []):
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for fc in bag.fcurves:
                        for kp in fc.keyframe_points:
                            kp.interpolation = "LINEAR"
        for fc in getattr(ad.action, "fcurves", []):
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"


# ----------------------------------------------------------------------------------------------
# Formations (functions of index and loop time; all periodic in t)
# ----------------------------------------------------------------------------------------------


def interlock_block(n, cols, rows, layers, pitch=(0.78, 0.98, 0.3)):
    """Interlocking block: pairs of L-modules rotated 180° about z close into a rectangle; layers alternate orientation."""
    out = []
    i = 0
    for lz in range(layers):
        for r in range(rows):
            for c in range(cols):
                for half in (0, 1):
                    if i >= n:
                        return out
                    x = (c - (cols - 1) / 2) * pitch[0] * 1.15 + (0.14 if half else -0.14)
                    y = (r - (rows - 1) / 2) * pitch[1] * 1.12 + (0.12 if half else -0.12)
                    z = (lz - (layers - 1) / 2) * pitch[2] * 1.1
                    rz = math.pi if half else 0.0
                    rz += (math.pi / 2) * (lz % 2)
                    out.append((Vector((x, y, z)), q_from_euler(0, 0, rz), 1.0))
                    i += 1
    while len(out) < n:
        out.append(out[-1])
    return out


def scatter(n, seed, spread=(6.5, 3.6, 3.0), center=(0, 0, 0)):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        th = rnd.random() * math.tau
        r = 0.35 + math.sqrt(rnd.random()) * 0.65
        p = Vector((math.cos(th) * r * spread[0] + center[0], math.sin(th) * r * spread[1] + center[1], (rnd.random() - 0.5) * spread[2] + center[2]))
        q = q_from_euler(rnd.random() * math.tau, rnd.random() * math.tau, rnd.random() * math.tau)
        out.append((p, q, 0.85 + rnd.random() * 0.35))
    return out


def drift(tf, t, i, amp=0.18, spin=1.0):
    """Periodic drift and tumble around a transform (integer cycles per loop so t=0 and t=1 match)."""
    p, q, s = tf
    ph = i * 1.37
    p = p + Vector((math.sin(math.tau * t + ph) * amp, math.cos(math.tau * 2 * t + ph) * amp * 0.6, math.sin(math.tau * t + ph * 2) * amp * 0.8))
    # Whole turns per loop on each axis, so the tumble at t=1 equals t=0 (a half turn made the loop jump).
    turns = max(1, round(spin))
    q = q @ q_from_euler(math.tau * t * turns * ((i % 3) - 1 or 1), math.tau * t * turns, 0)
    return (p, q, s)


# ----------------------------------------------------------------------------------------------
# Films
# ----------------------------------------------------------------------------------------------

FILMS = {}


def film(name, seconds):
    def deco(fn):
        FILMS[name] = (fn, seconds)
        return fn

    return deco


@film("assembly", 10)
def film_assembly(frames, mats, meshes):
    """Systems in motion — scattered modules (the problem) assemble into an interlocked system,
    hold while data nodes travel through it, then release back into the field. Navy studio."""
    world(NAVY, 0.25)
    backdrop("#0d1f45", rough=0.45, y=-2.6)
    area_light("Key", (-5, 6.5, 6), (0, 0, 0), 5, 900, "#ffffff", size_y=3)
    area_light("Rim", (6, 2.5, -5), (0, 0, 0), 3, 1400, "#7fb0ff")
    area_light("Strip", (0, -1, 7.5), (0, 0, 0), 9, 140, "#cfe0ff", size_y=0.5)
    area_light("Top", (0, 9, 0), (0, 0, 0), 8, 260, "#ffffff")
    cam = camera(55, fstop=4.0)

    n = 36
    kinds = ["navy"] * 18 + ["ceramic"] * 12 + ["velvet"] * 6
    random.Random(7).shuffle(kinds)
    obs = [instance(meshes["L"], mats[kinds[i]], f"M{i}") for i in range(n)]
    nodes = [instance(meshes["node"], mats["node"], f"N{j}") for j in range(10)]
    A = scatter(n, 3, spread=(6.8, 2.5, 3.2), center=(0, 0.35, 0))
    B = interlock_block(n, 3, 3, 2)
    stagger = [random.Random(100 + i).random() for i in range(n)]
    # System pose: block rotated to show depth.
    sys_rot = q_from_euler(math.radians(12), math.radians(-34), 0)
    for f in range(frames + 1):
        t = f / frames
        for i, ob in enumerate(obs):
            sd = stagger[i] * 0.12
            k_in = back_out(window(t, 0.22 + sd, 0.42 + sd), 1.2)
            k_out = smooth(window(t, 0.74 + sd * 0.8, 0.94 + sd * 0.8))
            a = drift(A[i], t, i, amp=0.22, spin=1.0)
            bp, bq, bs = B[i]
            hold_spin = q_from_euler(0, math.tau * 0.16 * smooth(window(t, 0.35, 0.8)), 0)
            b = ((hold_spin @ sys_rot) @ bp, (hold_spin @ sys_rot) @ bq, 0.92)
            k = k_in * (1 - k_out)
            key(ob, f + 1, mix_tf(a, b, k))
        # Nodes: orbit around the field; inside the system they travel along its rows.
        for j, nd in enumerate(nodes):
            ph = j / len(nodes)
            ang = math.tau * (t + ph)
            orbit = Vector((math.cos(ang) * 4.6, math.sin(ang * 2) * 1.6, math.sin(ang) * 2.2))
            u = (t * 3 + ph) % 1.0
            row = (j % 3) - 1
            inside = Vector(((u - 0.5) * 2.8, row * 1.1, 0.55 if j % 2 else -0.55))
            inside = sys_rot @ inside
            k = window(t, 0.38, 0.5) * (1 - window(t, 0.72, 0.84))
            pos = orbit.lerp(inside, k)
            s = 0.9 + 0.5 * k
            key(nd, f + 1, (pos, q_from_euler(0, math.tau * 2 * t + j, 0), s))
        # Camera: slow periodic arc and push-in during assembly.
        push = smooth(window(t, 0.25, 0.5)) * (1 - smooth(window(t, 0.78, 0.98)))
        ang = math.radians(-14) + math.sin(math.tau * t) * math.radians(10)
        dist = 15.0 - 3.0 * push
        cam.location = Vector((math.sin(ang) * dist, 1.4 + 0.6 * math.cos(math.tau * t), math.cos(ang) * dist))
        aim(cam, (0, -0.1, 0))
        cam.keyframe_insert("location", frame=f + 1)
        cam.keyframe_insert("rotation_euler", frame=f + 1)
        cam.data.dof.focus_distance = dist
        cam.data.keyframe_insert("dof.focus_distance", frame=f + 1)
    linearize(obs + nodes + [cam])


@film("engineering", 8)
def film_engineering(frames, mats, meshes):
    """Technology Engineering — an interlocking lattice that re-sorts itself row by row (systems
    being re-architected) while nodes stream along the rows like data. Light cloud studio."""
    world(CLOUD, 0.6)
    backdrop("#eef2f8", rough=0.7, y=-1.9)
    area_light("Key", (-4, 7, 5), (0, 0, 0), 6, 700, "#ffffff", size_y=4)
    area_light("Rim", (5, 3, -4), (0, 0, 0), 3, 500, "#9cc0ff")
    area_light("Fill", (5, 1, 6), (0, 0, 0), 6, 120, "#ffffff")
    cam = camera(60, fstop=5.6)
    cols, rows = 7, 4
    n = cols * rows
    obs = []
    for i in range(n):
        r, c = divmod(i, cols)
        kind = "velvet" if (c + r * 2) % 7 == 3 else ("navy" if (c + r) % 2 == 0 else "ceramic")
        obs.append(instance(meshes["L"], mats[kind], f"M{i}"))
    nodes = [instance(meshes["node"], mats["node"], f"N{j}") for j in range(8)]
    pitch = 0.92
    # Odd-even transposition network: neighbours swap places (one passes over, the other under), even
    # pairs then odd pairs; after 2 * cols swaps every module is back home, so the film loops cleanly.
    steps = 2 * cols
    track = [[c] for c in range(cols)]  # track[element][step] -> column
    order = list(range(cols))
    for st in range(steps):
        start = st % 2
        for c in range(start, cols - 1, 2):
            order[c], order[c + 1] = order[c + 1], order[c]
        for col, el in enumerate(order):
            track[el].append(col)
    for f in range(frames + 1):
        t = f / frames
        for i, ob in enumerate(obs):
            r, c = divmod(i, cols)
            tt = (t + r * 0.13) % 1.0
            st_f = tt * steps
            st = int(st_f) % steps
            k = smooth(window(st_f - int(st_f), 0.18, 0.82))
            c0, c1 = track[c][st], track[c][st + 1]
            cc = c0 + (c1 - c0) * k
            over = math.sin(math.pi * k) * (0.42 if c1 > c0 else -0.42 if c1 < c0 else 0)
            x = (cc - (cols - 1) / 2) * pitch
            y = (r - (rows - 1) / 2) * pitch
            rz = ((c + 2 * r) % 4) * (math.pi / 2)
            key(ob, f + 1, (Vector((x, y, over + ((c + r) % 2) * 0.12)), q_from_euler(0, 0, rz), 1.0))
        for j, nd in enumerate(nodes):
            u = (t * (1 + j % 2) + j / len(nodes)) % 1.0
            r = j % rows
            x = (u - 0.5) * cols * pitch
            y = (r - (rows - 1) / 2) * pitch + pitch / 2
            key(nd, f + 1, (Vector((x, y, 0.42)), q_from_euler(0, 0, math.tau * t * 2), 0.9))
        ang = math.radians(28) + math.sin(math.tau * t) * math.radians(6)
        cam.location = Vector((math.sin(ang) * 13.5, 3.2, math.cos(ang) * 13.5))
        aim(cam, (0.3, -0.3, 0))
        cam.data.dof.focus_distance = 14.0
        cam.keyframe_insert("location", frame=f + 1)
        cam.keyframe_insert("rotation_euler", frame=f + 1)
    # The lattice lies in the x/y plane facing the camera from above-front.
    linearize(obs + nodes + [cam])


@film("experience", 8)
def film_experience(frames, mats, meshes):
    """Digital Experience — soft velvet and ceramic modules turning behind a glass interface slab;
    the glass bends their shapes as they pass (interface over system). Pale blue studio."""
    world("#e9f0fb", 0.7)
    backdrop("#e4ecf8", rough=0.75, y=-2.2)
    area_light("Key", (-5, 6, 4), (0, 0, 0), 7, 650, "#ffffff", size_y=4)
    area_light("Back", (2, 3, -6), (0, 0, 0), 6, 900, "#b9cdff")
    area_light("Fill", (6, 0, 5), (0, 0, 0), 5, 160, "#ffffff")
    cam = camera(65, fstop=3.2)
    glass = bpy.data.objects.new("Glass", meshes["slab"])
    bpy.context.scene.collection.objects.link(glass)
    glass.data.materials.clear()
    glass.data.materials.append(mats["glass"])
    glass.location = (0.0, 0.0, 0.9)
    glass.rotation_euler = (0, math.radians(-12), 0)
    spec = [("velvet", 1.35), ("ceramic", 1.15), ("navy", 1.0), ("gloss_blue", 0.75), ("ceramic", 0.9), ("velvet", 0.7)]
    obs = [instance(meshes["L"], mats[k], f"M{i}") for i, (k, _) in enumerate(spec)]
    nodes = [instance(meshes["node"], mats["node"], f"N{j}") for j in range(3)]
    for f in range(frames + 1):
        t = f / frames
        for i, ob in enumerate(obs):
            s = spec[i][1]
            ph = i / len(obs)
            ang = math.tau * (t + ph)
            pos = Vector((math.cos(ang) * 1.9, math.sin(ang * 1.0) * 0.55 + (i % 3 - 1) * 0.5, math.sin(ang) * 1.1 - 0.9))
            rot = q_from_euler(math.radians(15) + 0.3 * math.sin(ang), ang * 1.0 + i, math.radians(10) * math.cos(ang))
            key(ob, f + 1, (pos, rot, s))
        for j, nd in enumerate(nodes):
            ang = math.tau * (t * 2 + j / 3)
            key(nd, f + 1, (Vector((math.cos(ang) * 2.6, 1.3 + 0.2 * math.sin(ang * 2), math.sin(ang) * 1.2)), q_from_euler(0, ang, 0), 1.3))
        cam.location = Vector((math.sin(math.tau * t) * 0.6, 0.6 + 0.2 * math.cos(math.tau * t), 11.5))
        aim(cam, (0, 0, 0))
        cam.data.dof.focus_distance = 10.6
        cam.keyframe_insert("location", frame=f + 1)
        cam.keyframe_insert("rotation_euler", frame=f + 1)
    linearize(obs + nodes + [cam])


@film("growth", 8)
def film_growth(frames, mats, meshes):
    """Growth & Optimization — an endless staircase: the lowest step lifts to the top as every step
    climbs one place, nodes ride the treads. Brand-blue studio with white and navy modules."""
    world(BLUE, 0.35)
    backdrop("#1766d8", rough=0.55, y=-2.6)
    area_light("Key", (-4, 7, 6), (0, 0, 0), 6, 800, "#ffffff", size_y=4)
    area_light("Rim", (6, 2, -5), (0, 0, 0), 3, 1100, "#ffffff")
    area_light("Fill", (5, -1, 6), (0, 0, 0), 6, 120, "#dfe8ff")
    cam = camera(50, fstop=4.5)
    steps, lanes = 9, 2
    obs = []
    for i in range(steps * lanes):
        lane, s = divmod(i, steps)
        kind = "ceramic" if lane == 0 else "navy"  # per lane, so the per-cycle re-index is invisible
        obs.append(instance(meshes["L"], mats[kind], f"M{i}"))
    nodes = [instance(meshes["node"], mats["node_white"], f"N{j}") for j in range(4)]
    step = (0.5, 0.36)
    for f in range(frames + 1):
        t = f / frames
        cycles = 2  # two full step advances per loop
        u = (t * cycles) % 1.0
        adv = smooth(window(u, 0.15, 0.75))
        for i, ob in enumerate(obs):
            lane, s = divmod(i, steps)
            k = s + adv
            pos = Vector((-(steps - 1) * step[0] / 2 + k * step[0], -(steps - 1) * step[1] / 2 + k * step[1], (lane - 0.5) * 1.0))
            sc = 1.0
            if k > steps - 1:  # the top step fades out by shrinking while the bottom one is born
                sc = max(0.0, 1 - (k - (steps - 1)) / 1.0)
            if s == 0:
                sc = min(sc, adv) if adv < 1 else sc
            key(ob, f + 1, (pos, q_from_euler(0, 0, 0), max(sc, 0.001)))
        for j, nd in enumerate(nodes):
            uu = (t * 2 + j / 4) % 1.0
            k = uu * (steps - 1)
            lane = j % 2
            pos = Vector((-(steps - 1) * step[0] / 2 + k * step[0], -(steps - 1) * step[1] / 2 + k * step[1] + 0.62, (lane - 0.5) * 1.0))
            key(nd, f + 1, (pos, q_from_euler(0, math.tau * t * 3, 0), 1.2))
        ang = math.radians(-32) + math.sin(math.tau * t) * math.radians(4)
        cam.location = Vector((math.sin(ang) * 12 + 0.6, -0.2, math.cos(ang) * 12))
        aim(cam, (0.2, 0.25, 0))
        cam.data.dof.focus_distance = 12.2
        cam.keyframe_insert("location", frame=f + 1)
        cam.keyframe_insert("rotation_euler", frame=f + 1)
    linearize(obs + nodes + [cam])


@film("rnd", 8)
def film_rnd(frames, mats, meshes):
    """Products & R&D — one large module opens into an exploded view of stacked layers (the inner
    structure), turns, and closes again. Dark graphite-navy studio, single strong key."""
    world("#08142e", 0.2)
    backdrop("#0a1836", rough=0.4, y=-2.4)
    area_light("Key", (-4, 6, 5), (0, 0, 0), 4, 1100, "#ffffff", size_y=2)
    area_light("Rim", (5, 2, -4), (0, 0, 0), 2, 1500, "#6aa2ff")
    area_light("Under", (0, -3, 3), (0, 0, 0), 5, 90, "#2E7CF6")
    cam = camera(70, fstop=3.5)
    layers = 7
    order = ["navy", "graphite", "gloss_blue", "graphite", "ceramic", "graphite", "navy"]
    obs = [instance(meshes["L_thin"], mats[order[i]], f"Layer{i}") for i in range(layers)]
    nodes = [instance(meshes["node"], mats["node"], f"N{j}") for j in range(2)]
    for f in range(frames + 1):
        t = f / frames
        open_k = smooth(window(t, 0.12, 0.42)) * (1 - smooth(window(t, 0.7, 0.95)))
        spin = q_from_euler(math.radians(-12), math.radians(-30) + math.tau * 0.25 * math.sin(math.pi * t) ** 2, 0)
        for i, ob in enumerate(obs):
            z = (i - (layers - 1) / 2) * (0.05 + 0.42 * open_k)
            y = (i - (layers - 1) / 2) * 0.06 * open_k
            key(ob, f + 1, (spin @ Vector((0, y, z)), spin @ q_from_euler(0, 0, 0), 1.9))
        for j, nd in enumerate(nodes):
            base = Vector((0.95, 0.9, 0)) if j == 0 else Vector((1.55, 1.55, 0))
            pos = spin @ (base * 1.9 * (0.55 + 0.45 * (1 - open_k)) + Vector((0, 0, 0.6 * open_k * (1 if j else -1))))
            key(nd, f + 1, (pos, spin @ q_from_euler(0, 0, math.pi / 4), 1.7 if j == 0 else 1.0))
        cam.location = Vector((0.4 * math.sin(math.tau * t), 0.5, 12.5))
        aim(cam, (0, 0, 0))
        cam.data.dof.focus_distance = 12.3
        cam.keyframe_insert("location", frame=f + 1)
        cam.keyframe_insert("rotation_euler", frame=f + 1)
    linearize(obs + nodes + [cam])


@film("team", 8)
def film_team(frames, mats, meshes):
    """People — modules arrive from different directions and lock into pairs, then one cluster
    (different finishes, one structure). Warm cloud studio."""
    world("#f3f5f9", 0.35)
    backdrop("#e9edf4", rough=0.8, y=-1.9)
    area_light("Key", (-5, 6, 5), (0, 0, 0), 6, 420, "#fff6ee", size_y=4)
    area_light("Rim", (5, 3, -5), (0, 0, 0), 3, 520, "#a9c6f7")
    area_light("Fill", (5, 0, 6), (0, 0, 0), 6, 70, "#ffffff")
    cam = camera(55)
    kinds = ["navy", "ceramic", "velvet", "ceramic", "navy", "gloss_blue", "ceramic", "navy"]
    obs = [instance(meshes["L"], mats[kinds[i]], f"M{i}") for i in range(len(kinds))]
    nodes = [instance(meshes["node"], mats["node"], f"N{j}") for j in range(2)]
    # Final formation: a 4 x 2 interlocking lattice (each module quarter-turned by grid parity).
    B = []
    for i in range(len(kinds)):
        r, c = divmod(i, 4)
        B.append((Vector(((c - 1.5) * 0.9, (r - 0.5) * 0.9, ((c + r) % 2) * 0.12)), q_from_euler(0, 0, ((c + 2 * r) % 4) * (math.pi / 2)), 1.0))
    rnd = random.Random(11)
    starts = []
    for i in range(len(kinds)):
        ang = math.tau * i / len(kinds) + 0.3
        starts.append((Vector((math.cos(ang) * 6.5, math.sin(ang) * 3.2, -1.5 + rnd.random() * 2)), q_from_euler(rnd.random() * 6, rnd.random() * 6, rnd.random() * 6), 1.0))
    for f in range(frames + 1):
        t = f / frames
        for i, ob in enumerate(obs):
            sd = i * 0.035
            k = back_out(window(t, 0.08 + sd, 0.36 + sd), 1.1) * (1 - smooth(window(t, 0.8 + sd * 0.5, 0.97)))
            rot = q_from_euler(math.radians(-14), math.radians(26) + 0.4 * math.sin(math.tau * t), 0)
            b = (rot @ (B[i][0] * 1.25), rot @ B[i][1], 1.25)
            a = drift(starts[i], t, i, amp=0.25, spin=0.5)
            key(ob, f + 1, mix_tf(a, b, k))
        for j, nd in enumerate(nodes):
            ang = math.tau * (t + j / 2)
            key(nd, f + 1, (Vector((math.cos(ang) * 2.4, 1.6 + 0.3 * math.sin(ang * 2), math.sin(ang) * 1.4)), q_from_euler(0, ang, 0), 1.4))
        cam.location = Vector((math.sin(math.tau * t) * 0.8, 1.0, 11.0))
        aim(cam, (0, 0, 0))
        cam.data.dof.focus_distance = 11
        cam.keyframe_insert("location", frame=f + 1)
        cam.keyframe_insert("rotation_euler", frame=f + 1)
    linearize(obs + nodes + [cam])


# ----------------------------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------------------------


def main():
    o = parse_args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_render(o)
    fn, seconds = FILMS[o["film"]]
    frames = o["frames"] or seconds * o["fps"]
    sc = bpy.context.scene
    sc.frame_start = 1
    sc.frame_end = frames  # frame frames+1 == frame 1 (seamless loop), so it is not rendered
    meshes = {"L": l_module_mesh(0.22), "L_thin": l_module_mesh(0.05), "node": node_mesh(), "slab": slab_mesh(1.9, 1.25, 0.07)}
    fn(frames, materials(), meshes)
    out_dir = os.path.abspath(os.path.join(o["out"], o["film"]))
    os.makedirs(out_dir, exist_ok=True)
    if o["still"] is not None:
        sc.frame_set(1 + int(round(o["still"] * frames)))
        sc.render.filepath = os.path.join(os.path.abspath(o["out"]), f"{o['film']}-still.png")
        bpy.ops.render.render(write_still=True)
    elif o["only"]:
        for part in o["only"].split(","):
            a, _, b = part.partition("-")
            for f in range(int(a), int(b or a) + 1):
                sc.frame_set(f)
                sc.render.filepath = os.path.join(out_dir, f"{f:04d}.png")
                bpy.ops.render.render(write_still=True)
    else:
        sc.render.filepath = os.path.join(out_dir, "####")
        bpy.ops.render.render(animation=True)


main()
