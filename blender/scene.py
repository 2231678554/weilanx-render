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
sc.cycles.samples = 64
sc.cycles.use_adaptive_sampling = True
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 6
sc.cycles.caustics_reflective = False
sc.cycles.caustics_refractive = False
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Punchy'
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

# ── 天空：低太阳的暮色 ──
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
nt = w.node_tree; nt.nodes.clear()
sky = nt.nodes.new('ShaderNodeTexSky'); sky.sky_type = 'NISHITA'
sky.sun_elevation = math.radians(2.2); sky.sun_rotation = math.radians(200)
sky.air_density = 2.2; sky.dust_density = 6.0; sky.sun_size = math.radians(2.2); sky.sun_intensity = 0.6
bg = nt.nodes.new('ShaderNodeBackground'); bg.inputs['Strength'].default_value = 0.55
out = nt.nodes.new('ShaderNodeOutputWorld')
nt.links.new(sky.outputs[0], bg.inputs[0]); nt.links.new(bg.outputs[0], out.inputs[0])

sun_dir = Vector((math.sin(math.radians(200)) * math.cos(math.radians(2.2)), math.cos(math.radians(200)) * math.cos(math.radians(2.2)), math.sin(math.radians(2.2))))
bpy.ops.object.light_add(type='SUN')
sun = bpy.context.object; sun.data.energy = 2.2; sun.data.color = srgb('#ffb070'); sun.data.angle = math.radians(3)
sun.rotation_euler = (-sun_dir).to_track_quat('-Z', 'Y').to_euler()
# 天光补一点冷色
bpy.ops.object.light_add(type='AREA', location=(0, 0, 40)); fill = bpy.context.object
fill.data.energy = 6000; fill.data.size = 80; fill.data.color = srgb('#6a6aa8')

# ── 水面：海洋修改器 + 反光材质 ──
bpy.ops.mesh.primitive_plane_add(size=2); water = bpy.context.object; water.name = 'water'
oc = water.modifiers.new('ocean', 'OCEAN')
oc.geometry_mode = 'GENERATE'; oc.spatial_size = 60; oc.resolution = 14; oc.repeat_x = 6; oc.repeat_y = 6
oc.wave_scale = 0.35; oc.choppiness = 0.9; oc.wind_velocity = 6; oc.wave_alignment = 0.4
oc.time = 0.0; oc.keyframe_insert('time', frame=1); oc.time = 5.0; oc.keyframe_insert('time', frame=N)
water.location = (0, 60, 0)
wm = bpy.data.materials.new('water'); wm.use_nodes = True
b = wm.node_tree.nodes['Principled BSDF']
b.inputs['Base Color'].default_value = (*srgb('#16303a'), 1); b.inputs['Roughness'].default_value = 0.06
b.inputs['IOR'].default_value = 1.33; b.inputs['Specular IOR Level'].default_value = 0.7
water.data.materials.append(wm)
for fc in water.animation_data.action.fcurves:
    for k in fc.keyframe_points: k.interpolation = 'LINEAR'

# ── 远山：三层噪声起伏，越远越淡（靠雾区分） ──
mtn_m = [mat('m%d' % i, srgb(c), 0.9) for i, c in enumerate(['#3a2e48', '#4a3a58', '#5e4a66'])]
for i, (dist, h, sx) in enumerate([(70, 9, 1.0), (110, 16, 1.3), (160, 26, 1.6)]):
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
wood = mat('wood', srgb('#4a2a18'), 0.6)
win = mat('win', srgb('#2a1a10'), 0.6, 0, srgb('#ffb050'), 6.0)
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
    o.data.materials.append(gold); return kid(o)
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
lant = mat('lant', srgb('#ff6a2a'), 0.4, 0, srgb('#ff7a30'), 18.0)
for i, (z0, hgt, wdt, dep) in enumerate(tiers):
    for j in range(5):
        x = -wdt / 2 + 0.6 + j * (wdt - 1.2) / 4
        for s in (-1, 1):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, location=(x, s * (dep / 2 + 0.7), z0 + hgt + 0.05))
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

# ── 合成：按距离加暮色薄雾 + 轻微辉光 ──
sc.view_layers[0].use_pass_mist = True
sc.world.mist_settings.start = 15; sc.world.mist_settings.depth = 160; sc.world.mist_settings.falloff = 'QUADRATIC'
sc.use_nodes = True; ct = sc.node_tree; ct.nodes.clear()
rl = ct.nodes.new('CompositorNodeRLayers')
mix = ct.nodes.new('CompositorNodeMixRGB'); mix.blend_type = 'MIX'; mix.inputs[2].default_value = (*srgb('#c88a78'), 1)
mul = ct.nodes.new('CompositorNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 0.75
ct.links.new(rl.outputs['Mist'], mul.inputs[0]); ct.links.new(mul.outputs[0], mix.inputs[0]); ct.links.new(rl.outputs['Image'], mix.inputs[1])
gl = ct.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.quality = 'HIGH'; gl.threshold = 1.2; gl.size = 7
ct.links.new(mix.outputs[0], gl.inputs[0])
lens = ct.nodes.new('CompositorNodeLensdist'); lens.inputs['Dispersion'].default_value = 0.01
ct.links.new(gl.outputs[0], lens.inputs[0])
co = ct.nodes.new('CompositorNodeComposite'); ct.links.new(lens.outputs[0], co.inputs[0])
print('SCENE_OK', len(bpy.data.objects))
