# Algoritma DBSCAN

Density-Based Spatial Clustering of Applications with Noise.

## Parameter

| Parameter | Fungsi |
|-----------|--------|
| **Epsilon (ε)** | Radius tetangga (radian) |
| **MinPts** | Minimal titik per cluster |

### Epsilon → Jarak

| ε (rad) | ε (km) | Efek |
|---------|--------|------|
| 0.001 | ~1 km | Cluster kecil, noise banyak |
| 0.01 | ~10 km | Cluster sedang |
| 0.05 | ~50 km | Cluster besar |

## Silhouette Score

| Rentang | Interpretasi |
|---------|--------------|
| 0.7 – 1.0 | Cluster sangat baik |
| 0.5 – 0.7 | Cluster baik |
| 0.25 – 0.5 | Cluster cukup |
| < 0.25 | Cluster lemah |

## Haversine Distance

```python
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * \
        np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
    return R * 2 * np.arcsin(np.sqrt(a))
```
