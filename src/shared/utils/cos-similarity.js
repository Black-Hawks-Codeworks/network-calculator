// Cosine Similartity Calculator

// Metraei poso paromoia einai duo dianusmata. px an duo belh(dianusmata) deixnoun sthn idia kateuthinsi tote exoun upsilo similarity.
// kanonika pairnei times -1 ews 1 emeis omws epeidh den tha exoume arnhtika resources, exoume pedio orismou cos(θ)Ε[0,1] opou konta sto 1 megalo similarity , konta sto 0 mikro similarity

// cos(θ) = (A·B) / (||A|| × ||B||) -> to sunhmitono ths gwnias pou sxhmatizoun duo Dianusmata A & B.

export function cosineSimilarity(vectorA, vectorB) {
  // upologismos tou eswterikou ginoumenou h dot product kata thn bibliografia
  // to formula A · B = a₁×b₁ + a₂×b₂ opou A=[a₁,a₂] B=[b₁,b₂]

  //   A = [3, 6] (VM: 3 CPU, 6 GB)
  //   B = [2, 4] (Node available: 2 CPU, 4 GB)
  //   Dot product = 3×2 + 6×4 = 6 + 24 = 30

  const dotProduct = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1];

  // magnitude h alliws mhkos twn vectos
  // ||A|| = √(a₁² + a₂²)

  const magnitudeA = Math.sqrt(vectorA[0] ** 2 + vectorA[1] ** 2);
  const magnitudeB = Math.sqrt(vectorB[0] ** 2 + vectorB[1] ** 2);

  // edge case 01 --> an o xrhsths eisagei mideniko dianusma
  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  // cos(θ) = dotProduct / (magA × magB)

  return dotProduct / (magnitudeA * magnitudeB);
}
