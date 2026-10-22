# 暮色运河·龙舟 —— 纯程序生成的 Blender 场景（5 秒，24fps）
import bpy, bmesh, math, random
from mathutils import Vector
random.seed(7)
FPS, N = 24, 120
sc = bpy.context.scene
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
sc.frame_start, sc.frame_end = 1, N
sc.render.fps = FPS
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 48
sc.cycles.use_adaptive_sampling = True
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 6
sc.cycles.caustics_reflective = False
sc.cycles.caustics_refractive = False
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.image_settings.file_format = 'PNG'

def mat(name, color, rough=0.5, metal=0.0, emit=None, es=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = es
    return m
def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)
def put(o, m, coll=None):
    o.data.materials.append(m); return o
def cube(name, loc, scale, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        bv = o.modifiers.new('bv', 'BEVEL'); bv.width = bevel; bv.segments = 2
    return put(o, m)

# ── 天空：自己调的暮色渐变（地平线橙 → 粉紫 → 深蓝紫）+ 落日 ──
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
nt = w.node_tree; nt.nodes.clear()
tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
nt.links.new(tc.outputs['Generated'], sep.inputs[0])
ramp = nt.nodes.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
cr.elements[0].position = 0.0; cr.elements[0].color = (*srgb('#3a2a3a'), 1)
cr.elements[1].position = 1.0; cr.elements[1].color = (*srgb('#1c1a3a'), 1)
for p, c in [(0.5, '#ffb070'), (0.53, '#f08a60'), (0.6, '#b8607a'), (0.72, '#5a3a6a')]:
    e = cr.elements.new(p); e.color = (*srgb(c), 1)
ma = nt.nodes.new('ShaderNodeMath'); ma.operation = 'MULTIPLY_ADD'; ma.inputs[1].default_value = 0.5; ma.inputs[2].default_value = 0.5
nt.links.new(sep.outputs['Z'], ma.inputs[0]); nt.links.new(ma.outputs[0], ramp.inputs[0])
bg = nt.nodes.new('ShaderNodeBackground'); bg.inputs['Strength'].default_value = 1.6
out = nt.nodes.new('ShaderNodeOutputWorld')
nt.links.new(ramp.outputs[0], bg.inputs[0]); nt.links.new(bg.outputs[0], out.inputs[0])
SUN = Vector((-30, 420, 9))
bpy.ops.mesh.primitive_uv_sphere_add(radius=11, location=SUN); sd = bpy.context.object
sm = mat('sun', srgb('#ffd8a0'), 1, 0, srgb('#ffcf90'), 12.0); sd.data.materials.append(sm)
sd.visible_shadow = False
bpy.ops.object.light_add(type='SUN')
sun = bpy.context.object; sun.data.energy = 3.0; sun.data.color = srgb('#ffa060'); sun.data.angle = math.radians(4)
sun.rotation_euler = (Vector((0, 0, 0)) - SUN).normalized().to_track_quat('-Z', 'Y').to_euler()
# 机位一侧的暖色补光 + 头顶冷色天光，避免逆光时船身全黑
bpy.ops.object.light_add(type='AREA', location=(12, -30, 10)); f1 = bpy.context.object
f1.data.energy = 9000; f1.data.size = 20; f1.data.color = srgb('#ff9a7a')
f1.rotation_euler = (Vector((-2, 0, 3)) - f1.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.light_add(type='AREA', location=(0, 0, 40)); fill = bpy.context.object
fill.data.energy = 5000; fill.data.size = 80; fill.data.color = srgb('#7a6ab8')

# ── 水面：大平面 + 动态噪声凹凸，反射天空和落日 ──
bpy.ops.mesh.primitive_plane_add(size=1200, location=(0, 300, 0)); water = bpy.context.object; water.name = 'water'
wm = bpy.data.materials.new('water'); wm.use_nodes = True; wn = wm.node_tree
b = wn.nodes['Principled BSDF']
b.inputs['Base Color'].default_value = (*srgb('#141c2a'), 1); b.inputs['Roughness'].default_value = 0.04
b.inputs['IOR'].default_value = 1.33
tco = wn.nodes.new('ShaderNodeTexCoord'); mp = wn.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.6, 0.18, 1)
wn.links.new(tco.outputs['Object'], mp.inputs[0])
nz = wn.nodes.new('ShaderNodeTexNoise'); nz.noise_dimensions = '4D'; nz.inputs['Scale'].default_value = 2.2; nz.inputs['Detail'].default_value = 6
wn.links.new(mp.outputs[0], nz.inputs['Vector'])
nz.inputs['W'].default_value = 0; nz.inputs['W'].keyframe_insert('default_value', frame=1)
nz.inputs['W'].default_value = 1.6; nz.inputs['W'].keyframe_insert('default_value', frame=N)
bump = wn.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.35; bump.inputs['Distance'].default_value = 0.1
wn.links.new(nz.outputs['Fac'], bump.inputs['Height']); wn.links.new(bump.outputs['Normal'], b.inputs['Normal'])
water.data.materials.append(wm)
for fc in wm.node_tree.animation_data.action.fcurves:
    for k in fc.keyframe_points: k.interpolation = 'LINEAR'

# ── 远山：三层噪声起伏，越远越淡（靠雾区分） ──
mtn_m = [mat('m%d' % i, srgb(c), 0.95, 0, srgb(c), [0.0, 0.25, 0.6][i]) for i, c in enumerate(['#2a2032', '#5a3a58', '#9a6a78'])]
for i, (dist, h, sx) in enumerate([(90, 10, 1.0), (170, 22, 1.4), (280, 40, 1.9)]):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=160, y_subdivisions=24, size=1)
    g = bpy.context.object; g.scale = (260 * sx, 30, 1); g.location = (0, dist, -0.5)
    bpy.ops.object.transform_apply(scale=True)
    tex = bpy.data.textures.new('t%d' % i, 'CLOUDS'); tex.noise_scale = 14 + i * 6; tex.noise_depth = 4
    d = g.modifiers.new('d', 'DISPLACE'); d.texture = tex; d.strength = h; d.mid_level = 0.25
    d.texture_coords = 'GLOBAL'
    g.data.materials.append(mtn_m[i])
    bpy.ops.object.shade_smooth()

# ── 龙舟 ──
lac = mat('lac', srgb('#7a1a12'), 0.35)
red = mat('red', srgb('#a8281c'), 0.5)
gold = mat('gold', srgb('#d8a040'), 0.3, 0.9)
tile = mat('tile', srgb('#2a2630'), 0.55)
wood = mat('wood', srgb('#4a2a18'), 0.6)
win = mat('win', srgb('#2a1a10'), 0.6, 0, srgb('#ffb050'), 1.6)
boat = bpy.data.objects.new('boat', None); sc.collection.objects.link(boat)
def kid(o): o.parent = boat; return o
# 船身：压扁的半个椭球
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1)
hull = bpy.context.object; hull.scale = (9, 2.2, 1.6); bpy.ops.object.transform_apply(scale=True)
bm = bmesh.new(); bm.from_mesh(hull.data)
bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 0.25), plane_no=(0, 0, 1), clear_outer=True)
for v in bm.verts:  # 两头上翘
    v.co.z += 0.06 * (v.co.x ** 2) * 0.12
bmesh.ops.contextual_create(bm, geom=[e for e in bm.edges if e.is_boundary])
bm.to_mesh(hull.data); bm.free()
bpy.ops.object.shade_smooth(); hull.data.materials.append(lac); kid(hull)
# 金色船舷线
bpy.ops.mesh.primitive_torus_add(major_radius=1, minor_radius=0.04, major_segments=96)
rim = bpy.context.object; rim.scale = (8.85, 2.1, 1); rim.location = (0, 0, 0.3); put(rim, gold); kid(rim)
# 龙头（贝塞尔曲线弯颈 + 头）与龙尾
def neck(pts, r, m, name):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 6
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for p, c in zip(sp.bezier_points, pts):
        p.co = c; p.handle_left_type = p.handle_right_type = 'AUTO'
    tp = bpy.data.curves[name]
    o = bpy.data.objects.new(name, cu); sc.collection.objects.link(o); o.data.materials.append(m)
    # 尾部变细
    for p in sp.bezier_points: p.radius = 1.0
    sp.bezier_points[-1].radius = 0.55
    return kid(o)
neck([(-8.6, 0, 0.3), (-9.8, 0, 1.4), (-9.6, 0, 3.0), (-10.4, 0, 3.6)], 0.42, gold, 'neck')
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.55, location=(-10.7, 0, 3.7)); hd = bpy.context.object; hd.scale = (1.5, 0.8, 0.75); put(hd, gold); kid(hd)
for s in (-1, 1):
    bpy.ops.mesh.primitive_cone_add(radius1=0.12, depth=0.9, location=(-10.4, 0.25 * s, 4.25)); h = bpy.context.object; h.rotation_euler = (0.4 * s, 0.5, 0); put(h, gold); kid(h)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(-11.1, 0.32 * s, 3.85)); e = bpy.context.object; put(e, win); kid(e)
neck([(8.6, 0, 0.3), (9.6, 0, 1.6), (9.2, 0, 3.0), (9.9, 0, 3.9)], 0.3, gold, 'tail')
# 三层楼阁
def roof(z, w, d, name):
    bm = bmesh.new()
    r = bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        if v.co.z > 0: v.co.x *= 0.55; v.co.y *= 0.4
        v.co.x *= w; v.co.y *= d; v.co.z *= 0.7
    # 屋檐四角上翘
    for v in bm.verts:
        if v.co.z < 0 and abs(v.co.x) > w * 0.45 and abs(v.co.y) > d * 0.45: v.co.z += 0.35
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.location = (0, 0, z)
    bv = o.modifiers.new('bv', 'BEVEL'); bv.width = 0.05; bv.segments = 2
    o.data.materials.append(tile); return kid(o)
tiers = [(0.55, 1.5, 12.0, 3.2), (2.4, 1.3, 9.0, 2.7), (4.0, 1.2, 6.2, 2.2)]
for i, (z0, hgt, wdt, dep) in enumerate(tiers):
    kid(cube('wall%d' % i, (0, 0, z0 + hgt / 2), (wdt / 2, dep / 2, hgt / 2), red, 0.03))
    n = int(wdt / 0.9)
    for j in range(n):
        x = -wdt / 2 + (j + 0.5) * wdt / n
        for s in (-1, 1):
            kid(cube('w%d_%d_%d' % (i, j, s), (x, s * (dep / 2 + 0.01), z0 + hgt * 0.5), (wdt / n * 0.32, 0.02, hgt * 0.28), win))
    roof(z0 + hgt + 0.25, wdt / 2 + 0.6, dep / 2 + 0.5, 'roof%d' % i)
# 顶亭
for sx in (-1, 1):
    for sy in (-1, 1):
        kid(cube('p', (sx * 1.6, sy * 0.8, 6.6), (0.08, 0.08, 0.9), red))
roof(7.7, 2.3, 1.4, 'roofTop')
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(0, 0, 8.4)); put(bpy.context.object, gold); kid(bpy.context.object)
# 灯笼（自发光）沿屋檐挂一排，并放几盏点光
lant = mat('lant', srgb('#ff6a2a'), 0.4, 0, srgb('#ff7a30'), 5.0)
for i, (z0, hgt, wdt, dep) in enumerate(tiers):
    for j in range(5):
        x = -wdt / 2 + 0.6 + j * (wdt - 1.2) / 4
        for s in (-1, 1):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(x, s * (dep / 2 + 0.75), z0 + hgt - 0.2))
            l = bpy.context.object; l.scale = (1, 1, 1.3); put(l, lant); kid(l)
for x in (-4, 0, 4):
    bpy.ops.object.light_add(type='POINT', location=(x, -2.4, 2.6)); p = bpy.context.object
    p.data.energy = 220; p.data.color = srgb('#ff9040'); p.data.shadow_soft_size = 0.4; kid(p)
# 彩旗：旗杆 + 带波浪的旗面
for k, (x, z, c) in enumerate([(-5.5, 3.2, '#d83a2a'), (-2, 5.4, '#e8c040'), (2, 5.4, '#3a8a4a'), (5.5, 3.2, '#3a6ad8'), (0, 9.0, '#d83a2a')]):
    kid(cube('pole%d' % k, (x, 0, z + 0.9), (0.04, 0.04, 0.9), wood))
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=24, y_subdivisions=8, size=1, location=(x + 0.55, 0, z + 1.45))
    f = bpy.context.object; f.rotation_euler = (math.pi / 2, 0, 0); f.scale = (1.1, 0.6, 1)
    wv = f.modifiers.new('wave', 'WAVE'); wv.height = 0.12; wv.width = 0.6; wv.speed = 0.08; wv.use_normal = True
    wv.start_position_x = x; wv.time_offset = -k * 7
    fm = mat('flag%d' % k, srgb(c), 0.7); fm.use_backface_culling = False; put(f, fm); kid(f)
    sd = f.modifiers.new('solid', 'SOLIDIFY'); sd.thickness = 0.01

# 龙舟运动：缓缓前行 + 轻微起伏摇摆
for fr in range(1, N + 1, 4):
    t = (fr - 1) / FPS
    boat.location = (-2.0 - 0.7 * t, 0, 0.05 * math.sin(t * 1.6))
    boat.rotation_euler = (0.012 * math.sin(t * 1.3 + 0.5), 0.008 * math.sin(t * 1.1), math.radians(-14))
    boat.keyframe_insert('location', frame=fr); boat.keyframe_insert('rotation_euler', frame=fr)

# 水面上的几只小渔船剪影 + 远处飞鸟
dark = mat('dark', srgb('#1a1418'), 0.8)
for k, (x, y) in enumerate([(-38, 46), (26, 52), (44, 40)]):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(x, y, 0.1)); s = bpy.context.object; s.scale = (2.2, 0.6, 0.4); put(s, dark)
    cube('mast%d' % k, (x, y, 1.4), (0.05, 0.05, 1.3), dark)
for k in range(9):
    bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.35, depth=0.06, location=(random.uniform(-30, 10), random.uniform(55, 75), random.uniform(14, 22)))
    bd = bpy.context.object; bd.scale = (1.6, 0.5, 1); put(bd, dark)
    for fr in (1, N):
        bd.location.x += 0 if fr == 1 else 6; bd.keyframe_insert('location', frame=fr)

# ── 摄像机：低机位慢推 ──
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
cam.data.lens = 32; cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 5.6
tgt = bpy.data.objects.new('tgt', None); sc.collection.objects.link(tgt)
tc = cam.constraints.new('TRACK_TO'); tc.target = tgt; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'
cam.data.dof.focus_object = boat
for fr, cl, tl in [(1, (10, -26, 2.4), (-1, 8, 4.2)), (N, (5.5, -21, 2.0), (-3.5, 8, 4.4))]:
    cam.location = cl; tgt.location = tl
    cam.keyframe_insert('location', frame=fr); tgt.keyframe_insert('location', frame=fr)

# ── 合成：轻微辉光 ──
sc.use_nodes = True; ct = sc.node_tree; ct.nodes.clear()
rl = ct.nodes.new('CompositorNodeRLayers')
gl = ct.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.quality = 'HIGH'; gl.threshold = 1.0; gl.size = 8
ct.links.new(rl.outputs['Image'], gl.inputs[0])
co = ct.nodes.new('CompositorNodeComposite'); ct.links.new(gl.outputs[0], co.inputs[0])
print('SCENE_OK', len(bpy.data.objects))
