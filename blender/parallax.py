# 2.5D 视差镜头：AI 图 + 深度网格 + 水波/柳摆/灯笼闪烁/流雾/辉光
import bpy, os, math, numpy as np
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "p")
FPS, NF = 24, int(os.environ.get("NF", "120"))
sc = bpy.context.scene
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
img = bpy.data.images.load(f"{A}/color.png"); IW, IH = img.size; AR = IW/IH
def mask(n):
    m = bpy.data.images.load(f"{A}/{n}.png"); m.colorspace_settings.name = "Non-Color"; return m
# ---------- 深度网格 ----------
g = np.load(f"{A}/disp_grid.npy").astype(np.float64); GH, GW = g.shape
NEAR, FAR, K = 4.2, 14.0, 0.5
z = 1.0/(1.0/FAR + g*(1.0/NEAR - 1.0/FAR))
u = np.linspace(0, 1, GW)[None, :].repeat(GH, 0); v = np.linspace(0, 1, GH)[:, None].repeat(GW, 1)
X = (u-0.5)*2*K*z; Y = (v-0.5)*2*K/AR*z
co = np.stack([X, Y, -z], -1).reshape(-1, 3)
idx = np.arange(GW*GH).reshape(GH, GW)
q = np.stack([idx[:-1,:-1], idx[:-1,1:], idx[1:,1:], idx[1:,:-1]], -1).reshape(-1, 4)
me = bpy.data.meshes.new("pic"); me.vertices.add(len(co)); me.vertices.foreach_set("co", co.ravel())
me.loops.add(q.size); me.loops.foreach_set("vertex_index", q.ravel())
me.polygons.add(len(q)); me.polygons.foreach_set("loop_start", np.arange(0, q.size, 4)); me.polygons.foreach_set("loop_total", np.full(len(q), 4))
uvl = me.uv_layers.new(name="UV"); uvs = np.stack([u, v], -1).reshape(-1, 2)[q.ravel()]
uvl.data.foreach_set("uv", uvs.ravel()); me.update(); me.validate()
pic = bpy.data.objects.new("pic", me); sc.collection.objects.link(pic)
# ---------- 材质 ----------
def drv_time(node):
    d = node.outputs[0].driver_add("default_value").driver; d.expression = f"frame/{FPS}"
mat = bpy.data.materials.new("pic"); mat.use_nodes = True; nt = mat.node_tree; N, L = nt.nodes, nt.links
for n in list(N): N.remove(n)
def node(t, **kw):
    n = N.new(t)
    for k, val in kw.items(): setattr(n, k, val)
    return n
def math_(op, a, b, clamp=False):
    n = node("ShaderNodeMath", operation=op, use_clamp=clamp)
    for i, x in enumerate((a, b)):
        if isinstance(x, (int, float)): n.inputs[i].default_value = x
        else: L.new(x, n.inputs[i])
    return n.outputs[0]
tc = node("ShaderNodeUVMap", uv_map="UV"); sep = node("ShaderNodeSeparateXYZ"); L.new(tc.outputs[0], sep.inputs[0])
U, V = sep.outputs[0], sep.outputs[1]
T = node("ShaderNodeValue"); drv_time(T); T = T.outputs[0]
def tex(im, vec=None, interp="Linear"):
    n = node("ShaderNodeTexImage", image=im, interpolation=interp, extension="EXTEND")
    L.new(vec if vec is not None else tc.outputs[0], n.inputs[0]); return n
water = tex(mask("water")).outputs[0]; lant = tex(mask("lantern")).outputs[0]; will = tex(mask("willow")).outputs[0]
# 水波：横向拉长的 4D 噪声
cmb = node("ShaderNodeCombineXYZ"); L.new(math_("MULTIPLY", U, 7.0), cmb.inputs[0]); L.new(math_("MULTIPLY", V, 140.0), cmb.inputs[1])
nz = node("ShaderNodeTexNoise", noise_dimensions="4D"); nz.inputs["Scale"].default_value = 1.0; nz.inputs["Detail"].default_value = 3.0
L.new(cmb.outputs[0], nz.inputs["Vector"]); L.new(math_("MULTIPLY", T, 1.1), nz.inputs["W"])
sp = node("ShaderNodeSeparateColor"); L.new(nz.outputs["Color"], sp.inputs[0])
near = math_("ADD", math_("MULTIPLY", math_("SUBTRACT", 1.0, V), 1.6), -0.2)    # 越近波越大
wamp = math_("MULTIPLY", water, near)
dxw = math_("MULTIPLY", math_("MULTIPLY", math_("SUBTRACT", sp.outputs[0], 0.5), wamp), 0.006)
dyw = math_("MULTIPLY", math_("MULTIPLY", math_("SUBTRACT", sp.outputs[1], 0.5), wamp), 0.010)
# 柳枝摆动：越靠下摆幅越大
ph = math_("ADD", math_("MULTIPLY", T, 2*math.pi*0.32), math_("MULTIPLY", V, 9.0))
sw = math_("ADD", math_("SINE", ph, 0), math_("MULTIPLY", math_("SINE", math_("MULTIPLY", ph, 2.3), 0), 0.35))
dxl = math_("MULTIPLY", math_("MULTIPLY", sw, will), math_("MULTIPLY", math_("SUBTRACT", 1.15, V), 0.0035))
uvn = node("ShaderNodeCombineXYZ")
L.new(math_("ADD", U, math_("ADD", dxw, dxl)), uvn.inputs[0]); L.new(math_("ADD", V, dyw), uvn.inputs[1])
col = tex(img, uvn.outputs[0], "Cubic")
# 灯笼闪烁
c2 = node("ShaderNodeCombineXYZ"); L.new(math_("MULTIPLY", U, 60.0), c2.inputs[0]); L.new(math_("MULTIPLY", V, 34.0), c2.inputs[1])
fz = node("ShaderNodeTexNoise", noise_dimensions="4D"); fz.inputs["Scale"].default_value = 1.0; fz.inputs["Detail"].default_value = 1.0
L.new(c2.outputs[0], fz.inputs["Vector"]); L.new(math_("MULTIPLY", T, 3.5), fz.inputs["W"])
fl = math_("ADD", math_("MULTIPLY", math_("SUBTRACT", fz.outputs[0], 0.5), 1.4), 0.35)
stren = math_("ADD", 1.0, math_("MULTIPLY", lant, fl))
em = node("ShaderNodeEmission"); L.new(col.outputs[0], em.inputs[0]); L.new(stren, em.inputs[1])
mo = node("ShaderNodeOutputMaterial"); L.new(em.outputs[0], mo.inputs[0])
pic.data.materials.append(mat)
# ---------- 流雾（两层，不同深度、反向漂移） ----------
def fog(zd, yimg, speed, dens, name):
    w = 2*K*zd*1.5; h = 2*K/AR*zd*0.55
    bpy.ops.mesh.primitive_plane_add(size=1); p = bpy.context.object; p.name = name
    p.scale = (w, h, 1); p.location = (0, (yimg-0.5)*2*K/AR*zd, -zd)
    m = bpy.data.materials.new(name); m.use_nodes = True; m.blend_method = "BLEND"
    n2, l2 = m.node_tree.nodes, m.node_tree.links
    for n in list(n2): n2.remove(n)
    gc = n2.new("ShaderNodeTexCoord"); sx = n2.new("ShaderNodeSeparateXYZ"); l2.new(gc.outputs["Generated"], sx.inputs[0])
    tv = n2.new("ShaderNodeValue"); drv_time(tv)
    mx = n2.new("ShaderNodeMath"); mx.operation = "MULTIPLY_ADD"; l2.new(tv.outputs[0], mx.inputs[0]); mx.inputs[1].default_value = speed; l2.new(sx.outputs[0], mx.inputs[2])
    cb = n2.new("ShaderNodeCombineXYZ"); l2.new(mx.outputs[0], cb.inputs[0]); my = n2.new("ShaderNodeMath"); my.operation = "MULTIPLY"; my.inputs[1].default_value = 0.35
    l2.new(sx.outputs[1], my.inputs[0]); l2.new(my.outputs[0], cb.inputs[1])
    nz2 = n2.new("ShaderNodeTexNoise"); nz2.noise_dimensions = "4D"; nz2.inputs["Scale"].default_value = 3.2; nz2.inputs["Detail"].default_value = 4.0
    l2.new(cb.outputs[0], nz2.inputs["Vector"]); tw = n2.new("ShaderNodeMath"); tw.operation = "MULTIPLY"; tw.inputs[1].default_value = 0.06; l2.new(tv.outputs[0], tw.inputs[0]); l2.new(tw.outputs[0], nz2.inputs["W"])
    mr = n2.new("ShaderNodeMapRange"); mr.inputs[1].default_value = 0.45; mr.inputs[2].default_value = 0.75; l2.new(nz2.outputs[0], mr.inputs[0])
    # 竖向高斯带
    dy = n2.new("ShaderNodeMath"); dy.operation = "SUBTRACT"; dy.inputs[1].default_value = 0.5; l2.new(sx.outputs[1], dy.inputs[0])
    dy2 = n2.new("ShaderNodeMath"); dy2.operation = "MULTIPLY"; l2.new(dy.outputs[0], dy2.inputs[0]); l2.new(dy.outputs[0], dy2.inputs[1])
    ex = n2.new("ShaderNodeMath"); ex.operation = "MULTIPLY"; ex.inputs[1].default_value = -14.0; l2.new(dy2.outputs[0], ex.inputs[0])
    ee = n2.new("ShaderNodeMath"); ee.operation = "EXPONENT"; l2.new(ex.outputs[0], ee.inputs[0])
    ex2 = n2.new("ShaderNodeMath"); ex2.operation = "MULTIPLY"; l2.new(ee.outputs[0], ex2.inputs[0]); l2.new(mr.outputs[0], ex2.inputs[1])
    a = n2.new("ShaderNodeMath"); a.operation = "MULTIPLY"; a.inputs[1].default_value = dens; a.use_clamp = True; l2.new(ex2.outputs[0], a.inputs[0])
    tr = n2.new("ShaderNodeBsdfTransparent"); e2 = n2.new("ShaderNodeEmission"); e2.inputs[0].default_value = (0.78, 0.52, 0.52, 1); e2.inputs[1].default_value = 0.85
    ms = n2.new("ShaderNodeMixShader"); l2.new(a.outputs[0], ms.inputs[0]); l2.new(tr.outputs[0], ms.inputs[1]); l2.new(e2.outputs[0], ms.inputs[2])
    out = n2.new("ShaderNodeOutputMaterial"); l2.new(ms.outputs[0], out.inputs[0])
    p.data.materials.append(m)
fog(7.5, 0.47, 0.010, 0.26, "fogFar")
fog(5.0, 0.40, -0.016, 0.16, "fogNear")
# ---------- 镜头 ----------
cd = bpy.data.cameras.new("cam"); cd.sensor_fit = "HORIZONTAL"; cd.sensor_width = 36; cd.lens = 36/(2*K)*1.07
cam = bpy.data.objects.new("cam", cd); sc.collection.objects.link(cam); sc.camera = cam
def key(f, loc, rz):
    cam.location = loc; cam.rotation_euler = (0, math.radians(rz), 0)
    cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_euler", frame=f)
key(1, (-0.08, 0.01, 0.0), 0.3); key(NF, (0.10, 0.05, -0.40), -0.3)
for fc in cam.animation_data.action.fcurves:
    for kp in fc.keyframe_points: kp.interpolation = "BEZIER"; kp.easing = "AUTO"
# ---------- 渲染设置 ----------
sc.render.engine = "CYCLES"; cy = sc.cycles; cy.device = "CPU"; cy.samples = int(os.environ.get("SPP", "16")); cy.use_denoising = False
cy.max_bounces = 0; cy.transparent_max_bounces = 8; cy.use_adaptive_sampling = False
sc.world = sc.world or bpy.data.worlds.new("w"); sc.world.use_nodes = True; sc.world.node_tree.nodes["Background"].inputs[1].default_value = 0
RX = 1080 if AR < 1 else 1920
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = RX, int(round(RX/AR/2))*2, int(os.environ.get("PCT", "100"))
sc.render.fps = FPS; sc.frame_start, sc.frame_end = 1, NF
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
sc.render.image_settings.file_format = "PNG"; sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.25
# 合成：辉光 + 暗角
sc.use_nodes = True; ct = sc.node_tree
for n in list(ct.nodes): ct.nodes.remove(n)
rl = ct.nodes.new("CompositorNodeRLayers"); gl = ct.nodes.new("CompositorNodeGlare")
gl.glare_type = "FOG_GLOW"; gl.quality = "HIGH"; gl.threshold = 0.75; gl.size = 8; gl.mix = -0.55
ct.links.new(rl.outputs[0], gl.inputs[0])
el = ct.nodes.new("CompositorNodeEllipseMask"); el.width, el.height = 1.25, 1.35
bl = ct.nodes.new("CompositorNodeBlur"); bl.filter_type = "GAUSS"; bl.use_relative = True; bl.factor_x = bl.factor_y = 18
ct.links.new(el.outputs[0], bl.inputs[0])
mv = ct.nodes.new("CompositorNodeMapRange"); mv.inputs[3].default_value = 0.72; mv.inputs[4].default_value = 1.0; ct.links.new(bl.outputs[0], mv.inputs[0])
mul = ct.nodes.new("CompositorNodeMixRGB"); mul.blend_type = "MULTIPLY"; mul.inputs[0].default_value = 1
ct.links.new(gl.outputs[0], mul.inputs[1]); ct.links.new(mv.outputs[0], mul.inputs[2])
co_ = ct.nodes.new("CompositorNodeComposite"); ct.links.new(mul.outputs[0], co_.inputs[0])
