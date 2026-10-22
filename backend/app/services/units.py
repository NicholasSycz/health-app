"""Unit handling for food logs.

Three kinds of unit, distinguished by what it takes to resolve them to grams:

  mass    g, kg, oz, lb            pure arithmetic
  volume  ml, l, tsp, tbsp, cup,   needs the food's density
          fl_oz
  named   portion                  needs the food's own gram weight for that portion
  legacy  serving                  no gram weight at all; multiplies the food's macros

Volume factors follow FDA nutrition-labelling conventions (cup = 240 ml,
tbsp = 15 ml, tsp = 5 ml, fl oz = 30 ml) rather than exact US customary values,
because that is what the numbers printed on food labels assume.
"""

from typing import Dict, Optional

MASS_TO_GRAMS: Dict[str, float] = {
    "g": 1.0,
    "kg": 1000.0,
    "oz": 28.349523125,
    "lb": 453.59237,
}

VOLUME_TO_ML: Dict[str, float] = {
    "ml": 1.0,
    "l": 1000.0,
    "tsp": 5.0,
    "tbsp": 15.0,
    "fl_oz": 30.0,
    "cup": 240.0,
}

PORTION_UNIT = "portion"
SERVING_UNIT = "serving"

LOG_UNITS = (
    tuple(MASS_TO_GRAMS)
    + tuple(VOLUME_TO_ML)
    + (PORTION_UNIT, SERVING_UNIT)
)


class UnitError(ValueError):
    """Raised when an amount cannot be resolved to grams."""


def is_mass(unit: str) -> bool:
    return unit in MASS_TO_GRAMS


def is_volume(unit: str) -> bool:
    return unit in VOLUME_TO_ML


def to_grams(
    amount: float,
    unit: str,
    density_g_per_ml: Optional[float] = None,
    portion_gram_weight: Optional[float] = None,
) -> Optional[float]:
    """Resolve `amount` of `unit` to grams.

    Returns None for the 'serving' unit, which has no recorded gram weight.
    Raises UnitError when the food lacks the data the unit requires.
    """
    if unit == SERVING_UNIT:
        return None

    if is_mass(unit):
        return amount * MASS_TO_GRAMS[unit]

    if is_volume(unit):
        if density_g_per_ml is None:
            raise UnitError(
                "'{}' is a volume unit and this food has no known density. "
                "Log it in grams, or pick one of its portions.".format(unit)
            )
        return amount * VOLUME_TO_ML[unit] * density_g_per_ml

    if unit == PORTION_UNIT:
        if portion_gram_weight is None:
            raise UnitError("A portion must be selected when logging in portions.")
        return amount * portion_gram_weight

    raise UnitError("Unknown unit '{}'.".format(unit))
