import sys
from pathlib import Path
import unittest

# Ensure the src package is importable when tests run from repository root
PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = PROJECT_ROOT / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from services.mazeGeneration.maze_generator import GenerateurKruskal, Imperfecteur  # noqa: E402


class MazeGenerationCITest(unittest.TestCase):
    def test_kruskal_generator_structure(self):
        largeur, hauteur = 6, 5
        generateur = GenerateurKruskal()

        labyrinthe, murs_restants = generateur.generer(largeur, hauteur)

        self.assertEqual(len(labyrinthe), 2 * hauteur - 1)
        for idx, ligne in enumerate(labyrinthe):
            attendu = largeur - 1 if idx % 2 == 0 else largeur
            self.assertEqual(len(ligne), attendu)
            self.assertTrue(all(isinstance(cell, bool) for cell in ligne))

        self.assertGreater(len(murs_restants), 0)

    def test_imperfecteur_respects_bounds(self):
        largeur, hauteur = 8, 6
        generateur = GenerateurKruskal()
        imperfecteur = Imperfecteur()

        labyrinthe, murs_restants = generateur.generer(largeur, hauteur)
        lab_imparfait, tunnels_h, tunnels_v = imperfecteur.rendre_imparfait(
            labyrinthe,
            murs_restants,
            niveau_imperfection=0.25,
            largeur=largeur,
            hauteur=hauteur,
            nb_tunnels_horizontaux=2,
            nb_tunnels_verticaux=1,
        )

        self.assertEqual(len(lab_imparfait), 2 * hauteur - 1)
        for idx, ligne in enumerate(lab_imparfait):
            attendu = largeur - 1 if idx % 2 == 0 else largeur
            self.assertEqual(len(ligne), attendu)

        self.assertTrue(all(0 <= y < hauteur for y in tunnels_h))
        self.assertTrue(all(0 <= x < largeur for x in tunnels_v))
        self.assertLessEqual(len(tunnels_h), 2)
        self.assertLessEqual(len(tunnels_v), 1)


if __name__ == "__main__":
    unittest.main()
