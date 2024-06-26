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
    label: 'our hardcoded red triangle shader',
    code: `
      @vertex fn vs(
        @builtin(vertex_index) vertexIndex: u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f(0.0, 0.5),
          vec2f(-0.5, -0.5),
          vec2f(0.5, -0.5)
        );

        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }

      @fragment fn fs() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0);
      }
    `
  });

  const pipeline = device.createRenderPipeline({
    label: 'our hardcoded red triangle pipeline',
    layout: 'auto',
    vertex: {
      module
    },
    fragment: {
      module,
      targets: [
        {
          format: presentationFormat
        }
      ]
    },
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
      label: 'our encoder',
    })

    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.draw(3);
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  render();
}