import { Clock, Object3D } from 'https://unpkg.com/three@0.126.1/build/three.module.js';

const CLOCK = new Clock();

export class Animation {
	constructor(name, bones, preFrame) {
		this.name = name;
		this.bones = bones;
		this.preFrame = preFrame;
		this.animators = new Map();
	}

	setBoneAnimator(boneName, animator) {
		if (this.bones.getBone(boneName) === undefined) {
			throw new Error(`Bone '${boneName}' not found in bone structure!`);
		}
		this.animators.set(boneName, animator);
		return this;
	}

	tick(delta) {
		let context = {
			time: CLOCK.getElapsedTime(),
			delta
		};

		if (this.preFrame) {
			context = this.preFrame(context);
		}

		for (const [boneName, animator] of this.animators) {
			const bone = this.bones.getBone(boneName);
			animator(bone, context);
		}
	}
}