# Ce qui compte comme vérifié

Une affirmation est vérifiée quand, au moment de la fabrication, tu as vu la valeur à sa source et noté où et quand.

- Un dépôt : nom, étoiles, dernier push, issues ouvertes, licence, récupérés en direct ; signale les dépôts archivés, désactivés, les forks, et tout ce qui n’a pas eu de push depuis 180 jours.
- Un chiffre : le chiffre, la page où il se trouve, la date sur cette page.
- Une citation : les mots exacts, dans leur langue d’origine, et la page ou l’enregistrement d’où ils viennent.
- La méthode ou l’affirmation d’une personne : sa propre page, son livre ou sa conférence, pas un résumé.
- Un prix : la page des tarifs, aujourd’hui.
- L’affirmation du client lui-même : sa réponse dans `context/answers.json` sous credibility, ou son propre post.

Invérifiable veut dire inutilisé. Dis-le dans le brief au lieu d’adoucir la phrase.

## Noter les sources dans brief.md

```
## Sources
- Auteur, Titre du livre, chapitre 1 : commencer par la réponse, puis les raisons. Lu le 2026-09-03.
- github.com/owner/name : 2 338 étoiles, push le 2026-08-29, MIT. Récupéré le 2026-09-03.
- Client, answers.json credibility : « a placé 200 personnes en 4 ans ».
```

Une ligne par affirmation. La vérification du format lit cette liste ; une affirmation à l’écran ou dans la légende sans ligne ici fait échouer la fabrication.
