"use client"
import { registerBones, configureBoneyard } from 'boneyard-js/react'

import _note_card from './note-card.bones.json'

configureBoneyard({"color":"rgba(255, 255, 255, 0.25)","darkColor":"rgba(255, 255, 255, 0.25)","animate":"shimmer","shimmerColor":"rgba(255, 255, 255, 0.45)","darkShimmerColor":"rgba(255, 255, 255, 0.45)","speed":"1.8s","transition":250})

registerBones({
  "note-card": _note_card,
})

export default function SkeletonRegistry() {
  return null;
}
