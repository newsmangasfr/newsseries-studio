// The prompt starts the video; the talking-head skill decides every stage and every stop.
export function talkingVideoInstructions() {
  return 'Ne touche pas à mes rushes. Monte cette vidéo avec la skill talking-head : lis-la, ainsi que le modèle de chaque étape, et suis-les, y compris ce qu’elle dit de me montrer avant d’avancer. Crée la vidéo dans workspace/projects/<date>-talking-head-<slug> avec son project.json pour que mon espace de travail puisse la suivre, et copie le fichier livré dans workspace/output/<ce nom de dossier>/.';
}

// The Split explainer style: its own skill, the same project folder and output contract as Classic.
export function splitVideoInstructions(skill = 'split-explainer', style = null) {
  const own = style ? ` avec "style": "${style}" dans son project.json à côté de "format": "split-explainer"` : '';
  return `Ne touche pas à mes rushes. Monte cette vidéo avec la skill ${skill} : lis-la, ainsi que ses références, et suis-les. Utilise mon style enregistré pour ce style de vidéo ; s’il n’y en a pas encore, montre-moi d’abord les styles sur mon propre enregistrement et enregistre mon choix, comme le dit la skill. Crée la vidéo dans workspace/projects/<date>-${style || 'split-explainer'}-<slug>${own} pour que mon espace de travail puisse la suivre, lance son script d’étapes après chaque étape, et copie le fichier livré dans workspace/output/<ce nom de dossier>/.`;
}

export function talkingResumePrompt(project) {
  if (project.styleSkill) return `/${project.styleSkill}\nContinue ${JSON.stringify(project.path)} avec la skill ${project.styleSkill}, à partir de l’étape que montrent ses fichiers. Garde verrouillés les calques validés, et montre-moi ce que la skill dit de me montrer.`;
  return `/talking-head\nContinue ${JSON.stringify(project.path)} avec la skill talking-head, à partir de l’étape que montrent ses fichiers. Garde verrouillés les calques validés, et montre-moi ce que la skill dit de me montrer.`;
}
