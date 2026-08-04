# Algorithm: DBSCAN

**Density-Based Spatial Clustering of Applications with Noise**

## Why DBSCAN?

| Algorithm | Limitation for Geolocation |
|-----------|---------------------------|
| **K-Means** | Must specify K (number of clusters), spherical clusters only |
| **Hierarchical** | High computational cost for large datasets |
| **DBSCAN** | ✅ No K needed, arbitrary shapes, noise handling |

## Parameters

### Epsilon (ε)

Neighborhood radius in **radians** (for Haversine distance).

| ε (radians) | ε (km) | Effect |
|------------|--------|--------|
| 0.001 | ~1 km | Small clusters, more noise |
| 0.005 | ~5 km | Medium clusters |
| 0.01 | ~10 km | Large clusters, less noise |
| 0.05 | ~50 km | Very large clusters |

```python
# Convert km to radians
epsilon_rad = distance_km / 6371.0  # Earth radius
```

### MinPts

Minimum points required to form a cluster.

| MinPts | Effect |
|--------|--------|
| 2 | Clusters form easily, minimal noise |
| 3–5 | Standard, balanced |
| 5–10 | More solid clusters, increased noise |

## Silhouette Score

```mermaid
flowchart LR
    A[Compute a<br/>mean intra-cluster distance] --> C[Compute s = (b-a)/max(a,b)]
    B[Compute b<br/>mean distance to nearest cluster] --> C
    C --> D{s < 0.25?}
    D -->|Yes| E[Weak cluster]
    D -->|No| F{s < 0.5?}
    F -->|Yes| G[Reasonable cluster]
    F -->|No| H{s < 0.7?}
    H -->|Yes| I[Good cluster]
    H -->|No| J[Excellent cluster]
```

### Interpretation

| Range | Interpretation |
|-------|---------------|
| 0.7 – 1.0 | Well separated clusters |
| 0.5 – 0.7 | Reasonable separation |
| 0.25 – 0.5 | Overlapping clusters |
| < 0.25 | Invalid clustering |

## Haversine Distance

Distance between two geographic coordinates:

```python
import numpy as np

def haversine(lat1, lon1, lat2, lon2):
    """Distance in km between two coordinates."""
    R = 6371  # Earth radius (km)
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + \
        np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
    return R * 2 * np.arcsin(np.sqrt(a))
```
