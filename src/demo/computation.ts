export async function main () {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice() as GPUDevice;

  const canvas = document.querySelector('canvas');
  const context = canvas?.getContext('webgpu');

  if (!context) return;

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format: presentationFormat
  })

  const module = device.createShaderModule({
    label: 'doubling compute module',
    code: `
    @group(0) @binding(0) var<storage, read_write> data: array<f32>;

    @compute @workgroup_size(1) fn computeSomething(
      @builtin(global_invocation_id) id: vec3u
    ) {
      let i = id.x;
      data[i] = data[i] * 2.0;
    }
    `
  });

  const pipeline = device.createRenderPipeline({
    label: 'doubling compute pipeline',
    layout: 'auto',
    // @ts-ignore
    compute: {
      module
    },
  });

  const input = new Float32Array([1, 3, 5]);

  const workBuffer = device.createBuffer({
    label: 'our work buffer',
    size: input.byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
  });

  device.queue.writeBuffer(workBuffer, 0, input);

  const bindGroup = device.createBindGroup({
    label: 'our work bindGroup',
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: workBuffer
        }
      }
    ]
  });

  const renderPassDescriptor: GPURenderPassDescriptor = {
    label: 'our basic canvas renderPass',
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: [0.3, 0.3, 0.3, 1.0],
        loadOp: 'clear',
        storeOp: 'store'
      }
    ]  as GPURenderPassColorAttachment[]
  };
  

  function render () {
    const encoder = device.createCommandEncoder({
      label: 'doubling encoder',
    })

    const pass = encoder.beginComputePass({
      label: 'doubling compute pass'
    });

    pass.setPipeline(pipeline);

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  render();
}