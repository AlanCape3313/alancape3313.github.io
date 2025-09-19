import { Clock, Object3D } from 'three';
// Nota: No existe 'type import' en JS, así que asumimos que BoneStructure es una clase exportada en ./three/boneStructure
import { BoneStructure } from './three/boneStructure';

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