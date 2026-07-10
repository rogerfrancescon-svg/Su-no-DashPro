import { GrowthCurvePoint, Integrado, Visit } from './types';
import { pdfData } from './pdf-data';

export const growthCurve: GrowthCurvePoint[] = [
  { dia: 1, pesoInicial: 22.300, pesoFinal: 23.000, cmd: 1.080, consumoAcumulado: 1.080, gpd: 0.700 },
  { dia: 2, pesoInicial: 23.000, pesoFinal: 23.719, cmd: 1.093, consumoAcumulado: 2.173, gpd: 0.719 },
  { dia: 3, pesoInicial: 23.719, pesoFinal: 24.449, cmd: 1.116, consumoAcumulado: 3.289, gpd: 0.730 },
  { dia: 4, pesoInicial: 24.449, pesoFinal: 25.192, cmd: 1.140, consumoAcumulado: 4.429, gpd: 0.743 },
  { dia: 5, pesoInicial: 25.192, pesoFinal: 25.947, cmd: 1.163, consumoAcumulado: 5.593, gpd: 0.755 },
  { dia: 6, pesoInicial: 25.947, pesoFinal: 26.715, cmd: 1.186, consumoAcumulado: 6.779, gpd: 0.768 },
  { dia: 7, pesoInicial: 26.715, pesoFinal: 27.494, cmd: 1.209, consumoAcumulado: 7.988, gpd: 0.779 },
  { dia: 8, pesoInicial: 27.494, pesoFinal: 28.286, cmd: 1.232, consumoAcumulado: 9.221, gpd: 0.792 },
  { dia: 9, pesoInicial: 28.286, pesoFinal: 29.089, cmd: 1.255, consumoAcumulado: 10.476, gpd: 0.803 },
  { dia: 10, pesoInicial: 29.089, pesoFinal: 29.905, cmd: 1.278, consumoAcumulado: 11.754, gpd: 0.816 },
  { dia: 11, pesoInicial: 29.905, pesoFinal: 30.732, cmd: 1.301, consumoAcumulado: 13.055, gpd: 0.827 },
  { dia: 12, pesoInicial: 30.732, pesoFinal: 31.567, cmd: 1.323, consumoAcumulado: 14.379, gpd: 0.835 },
  { dia: 13, pesoInicial: 31.567, pesoFinal: 32.409, cmd: 1.346, consumoAcumulado: 15.724, gpd: 0.842 },
  { dia: 14, pesoInicial: 32.409, pesoFinal: 33.258, cmd: 1.368, consumoAcumulado: 17.092, gpd: 0.849 },
  { dia: 15, pesoInicial: 33.258, pesoFinal: 34.114, cmd: 1.390, consumoAcumulado: 18.482, gpd: 0.856 },
  { dia: 16, pesoInicial: 34.114, pesoFinal: 35.044, cmd: 1.575, consumoAcumulado: 20.057, gpd: 0.930 },
  { dia: 17, pesoInicial: 35.044, pesoFinal: 35.982, cmd: 1.601, consumoAcumulado: 21.658, gpd: 0.938 },
  { dia: 18, pesoInicial: 35.982, pesoFinal: 36.929, cmd: 1.626, consumoAcumulado: 23.285, gpd: 0.947 },
  { dia: 19, pesoInicial: 36.929, pesoFinal: 37.883, cmd: 1.652, consumoAcumulado: 24.936, gpd: 0.954 },
  { dia: 20, pesoInicial: 37.883, pesoFinal: 38.845, cmd: 1.677, consumoAcumulado: 26.613, gpd: 0.962 },
  { dia: 21, pesoInicial: 38.845, pesoFinal: 39.816, cmd: 1.701, consumoAcumulado: 28.314, gpd: 0.971 },
  { dia: 22, pesoInicial: 39.816, pesoFinal: 40.794, cmd: 1.726, consumoAcumulado: 30.040, gpd: 0.978 },
  { dia: 23, pesoInicial: 40.794, pesoFinal: 41.781, cmd: 1.750, consumoAcumulado: 31.790, gpd: 0.987 },
  { dia: 24, pesoInicial: 41.781, pesoFinal: 42.775, cmd: 1.774, consumoAcumulado: 33.565, gpd: 0.994 },
  { dia: 25, pesoInicial: 42.775, pesoFinal: 43.778, cmd: 1.798, consumoAcumulado: 35.362, gpd: 1.003 },
  { dia: 26, pesoInicial: 43.778, pesoFinal: 44.788, cmd: 1.821, consumoAcumulado: 37.184, gpd: 1.010 },
  { dia: 27, pesoInicial: 44.788, pesoFinal: 45.806, cmd: 1.845, consumoAcumulado: 39.028, gpd: 1.018 },
  { dia: 28, pesoInicial: 45.806, pesoFinal: 46.832, cmd: 1.868, consumoAcumulado: 40.896, gpd: 1.026 },
  { dia: 29, pesoInicial: 46.832, pesoFinal: 47.866, cmd: 1.890, consumoAcumulado: 42.786, gpd: 1.034 },
  { dia: 30, pesoInicial: 47.866, pesoFinal: 48.907, cmd: 1.913, consumoAcumulado: 44.699, gpd: 1.041 },
  { dia: 31, pesoInicial: 48.907, pesoFinal: 49.956, cmd: 1.935, consumoAcumulado: 46.635, gpd: 1.049 },
  { dia: 32, pesoInicial: 49.956, pesoFinal: 50.999, cmd: 1.957, consumoAcumulado: 48.592, gpd: 1.043 },
  { dia: 33, pesoInicial: 50.999, pesoFinal: 52.050, cmd: 1.979, consumoAcumulado: 50.571, gpd: 1.051 },
  { dia: 34, pesoInicial: 52.050, pesoFinal: 53.109, cmd: 2.000, consumoAcumulado: 52.571, gpd: 1.059 },
  { dia: 35, pesoInicial: 53.109, pesoFinal: 54.217, cmd: 2.181, consumoAcumulado: 54.751, gpd: 1.108 },
  { dia: 36, pesoInicial: 54.217, pesoFinal: 55.332, cmd: 2.204, consumoAcumulado: 56.955, gpd: 1.115 },
  { dia: 37, pesoInicial: 55.332, pesoFinal: 56.455, cmd: 2.227, consumoAcumulado: 59.182, gpd: 1.123 },
  { dia: 38, pesoInicial: 56.455, pesoFinal: 57.585, cmd: 2.250, consumoAcumulado: 61.432, gpd: 1.130 },
  { dia: 39, pesoInicial: 57.585, pesoFinal: 58.721, cmd: 2.272, consumoAcumulado: 63.704, gpd: 1.136 },
  { dia: 40, pesoInicial: 58.721, pesoFinal: 59.865, cmd: 2.294, consumoAcumulado: 65.999, gpd: 1.144 },
  { dia: 41, pesoInicial: 59.865, pesoFinal: 61.014, cmd: 2.316, consumoAcumulado: 68.315, gpd: 1.149 },
  { dia: 42, pesoInicial: 61.014, pesoFinal: 62.170, cmd: 2.338, consumoAcumulado: 70.653, gpd: 1.156 },
  { dia: 43, pesoInicial: 62.170, pesoFinal: 63.332, cmd: 2.359, consumoAcumulado: 73.012, gpd: 1.162 },
  { dia: 44, pesoInicial: 63.332, pesoFinal: 64.499, cmd: 2.380, consumoAcumulado: 75.393, gpd: 1.167 },
  { dia: 45, pesoInicial: 64.499, pesoFinal: 65.671, cmd: 2.401, consumoAcumulado: 77.794, gpd: 1.172 },
  { dia: 46, pesoInicial: 65.671, pesoFinal: 66.848, cmd: 2.421, consumoAcumulado: 80.215, gpd: 1.177 },
  { dia: 47, pesoInicial: 66.848, pesoFinal: 68.030, cmd: 2.441, consumoAcumulado: 82.656, gpd: 1.182 },
  { dia: 48, pesoInicial: 68.030, pesoFinal: 69.215, cmd: 2.461, consumoAcumulado: 85.117, gpd: 1.185 },
  { dia: 49, pesoInicial: 69.215, pesoFinal: 70.399, cmd: 2.524, consumoAcumulado: 87.641, gpd: 1.184 },
  { dia: 50, pesoInicial: 70.399, pesoFinal: 71.586, cmd: 2.543, consumoAcumulado: 90.185, gpd: 1.187 },
  { dia: 51, pesoInicial: 71.586, pesoFinal: 72.776, cmd: 2.562, consumoAcumulado: 92.747, gpd: 1.190 },
  { dia: 52, pesoInicial: 72.776, pesoFinal: 73.969, cmd: 2.581, consumoAcumulado: 95.328, gpd: 1.193 },
  { dia: 53, pesoInicial: 73.969, pesoFinal: 75.163, cmd: 2.599, consumoAcumulado: 97.927, gpd: 1.194 },
  { dia: 54, pesoInicial: 75.163, pesoFinal: 76.360, cmd: 2.617, consumoAcumulado: 100.544, gpd: 1.197 },
  { dia: 55, pesoInicial: 76.360, pesoFinal: 77.558, cmd: 2.634, consumoAcumulado: 103.178, gpd: 1.198 },
  { dia: 56, pesoInicial: 77.558, pesoFinal: 78.756, cmd: 2.651, consumoAcumulado: 105.830, gpd: 1.198 },
  { dia: 57, pesoInicial: 78.756, pesoFinal: 79.955, cmd: 2.668, consumoAcumulado: 108.498, gpd: 1.199 },
  { dia: 58, pesoInicial: 79.955, pesoFinal: 81.155, cmd: 2.685, consumoAcumulado: 111.182, gpd: 1.200 },
  { dia: 59, pesoInicial: 81.155, pesoFinal: 82.354, cmd: 2.701, consumoAcumulado: 113.883, gpd: 1.199 },
  { dia: 60, pesoInicial: 82.354, pesoFinal: 83.552, cmd: 2.716, consumoAcumulado: 116.599, gpd: 1.198 },
  { dia: 61, pesoInicial: 83.552, pesoFinal: 84.747, cmd: 2.731, consumoAcumulado: 119.331, gpd: 1.195 },
  { dia: 62, pesoInicial: 84.747, pesoFinal: 85.937, cmd: 2.746, consumoAcumulado: 122.077, gpd: 1.190 },
  { dia: 63, pesoInicial: 85.937, pesoFinal: 87.123, cmd: 2.761, consumoAcumulado: 124.838, gpd: 1.186 },
  { dia: 64, pesoInicial: 87.123, pesoFinal: 88.303, cmd: 2.775, consumoAcumulado: 127.613, gpd: 1.180 },
  { dia: 65, pesoInicial: 88.303, pesoFinal: 89.478, cmd: 2.788, consumoAcumulado: 130.401, gpd: 1.175 },
  { dia: 66, pesoInicial: 89.478, pesoFinal: 90.647, cmd: 2.802, consumoAcumulado: 133.203, gpd: 1.169 },
  { dia: 67, pesoInicial: 90.647, pesoFinal: 91.810, cmd: 2.814, consumoAcumulado: 136.017, gpd: 1.163 },
  { dia: 68, pesoInicial: 91.810, pesoFinal: 92.967, cmd: 2.827, consumoAcumulado: 138.844, gpd: 1.157 },
  { dia: 69, pesoInicial: 92.967, pesoFinal: 94.116, cmd: 2.839, consumoAcumulado: 141.683, gpd: 1.149 },
  { dia: 70, pesoInicial: 94.116, pesoFinal: 95.412, cmd: 2.806, consumoAcumulado: 144.489, gpd: 1.296 },
  { dia: 71, pesoInicial: 95.412, pesoFinal: 96.696, cmd: 2.819, consumoAcumulado: 147.308, gpd: 1.284 },
  { dia: 72, pesoInicial: 96.696, pesoFinal: 97.968, cmd: 2.831, consumoAcumulado: 150.139, gpd: 1.272 },
  { dia: 73, pesoInicial: 97.968, pesoFinal: 99.229, cmd: 2.843, consumoAcumulado: 152.982, gpd: 1.261 },
  { dia: 74, pesoInicial: 99.229, pesoFinal: 100.478, cmd: 2.854, consumoAcumulado: 155.836, gpd: 1.249 },
  { dia: 75, pesoInicial: 100.478, pesoFinal: 101.716, cmd: 2.864, consumoAcumulado: 158.700, gpd: 1.238 },
  { dia: 76, pesoInicial: 101.716, pesoFinal: 102.942, cmd: 2.875, consumoAcumulado: 161.574, gpd: 1.226 },
  { dia: 77, pesoInicial: 102.942, pesoFinal: 104.158, cmd: 2.884, consumoAcumulado: 164.459, gpd: 1.216 },
  { dia: 78, pesoInicial: 104.158, pesoFinal: 105.363, cmd: 2.894, consumoAcumulado: 167.353, gpd: 1.205 },
  { dia: 79, pesoInicial: 105.363, pesoFinal: 106.557, cmd: 2.903, consumoAcumulado: 170.255, gpd: 1.194 },
  { dia: 80, pesoInicial: 106.557, pesoFinal: 107.697, cmd: 2.834, consumoAcumulado: 173.089, gpd: 1.140 },
  { dia: 81, pesoInicial: 107.697, pesoFinal: 108.826, cmd: 2.841, consumoAcumulado: 175.930, gpd: 1.129 },
  { dia: 82, pesoInicial: 108.826, pesoFinal: 109.944, cmd: 2.849, consumoAcumulado: 178.779, gpd: 1.118 },
  { dia: 83, pesoInicial: 109.944, pesoFinal: 111.060, cmd: 2.871, consumoAcumulado: 181.650, gpd: 1.116 },
  { dia: 84, pesoInicial: 111.060, pesoFinal: 112.178, cmd: 2.898, consumoAcumulado: 184.548, gpd: 1.118 },
  { dia: 85, pesoInicial: 112.178, pesoFinal: 113.296, cmd: 2.925, consumoAcumulado: 187.473, gpd: 1.118 },
  { dia: 86, pesoInicial: 113.296, pesoFinal: 114.401, cmd: 2.952, consumoAcumulado: 190.425, gpd: 1.105 },
  { dia: 87, pesoInicial: 114.401, pesoFinal: 115.492, cmd: 2.980, consumoAcumulado: 193.405, gpd: 1.091 },
  { dia: 88, pesoInicial: 115.492, pesoFinal: 116.568, cmd: 2.980, consumoAcumulado: 196.385, gpd: 1.076 },
  { dia: 89, pesoInicial: 116.568, pesoFinal: 117.629, cmd: 2.980, consumoAcumulado: 199.365, gpd: 1.061 },
  { dia: 90, pesoInicial: 117.629, pesoFinal: 118.676, cmd: 2.980, consumoAcumulado: 202.345, gpd: 1.047 },
  { dia: 91, pesoInicial: 118.676, pesoFinal: 119.707, cmd: 2.980, consumoAcumulado: 205.325, gpd: 1.031 },
  { dia: 92, pesoInicial: 119.707, pesoFinal: 120.723, cmd: 2.980, consumoAcumulado: 208.305, gpd: 1.016 },
  { dia: 93, pesoInicial: 120.723, pesoFinal: 121.723, cmd: 2.980, consumoAcumulado: 211.285, gpd: 1.000 },
  { dia: 94, pesoInicial: 121.723, pesoFinal: 122.707, cmd: 2.980, consumoAcumulado: 214.265, gpd: 0.984 },
  { dia: 95, pesoInicial: 122.707, pesoFinal: 123.687, cmd: 2.980, consumoAcumulado: 217.245, gpd: 0.980 },
  { dia: 96, pesoInicial: 123.687, pesoFinal: 124.660, cmd: 2.980, consumoAcumulado: 220.225, gpd: 0.973 },
  { dia: 97, pesoInicial: 124.660, pesoFinal: 125.627, cmd: 2.980, consumoAcumulado: 223.205, gpd: 0.967 },
  { dia: 98, pesoInicial: 125.627, pesoFinal: 126.586, cmd: 2.980, consumoAcumulado: 226.185, gpd: 0.959 },
  { dia: 99, pesoInicial: 126.586, pesoFinal: 127.536, cmd: 2.980, consumoAcumulado: 229.165, gpd: 0.950 },
  { dia: 100, pesoInicial: 127.536, pesoFinal: 128.478, cmd: 2.980, consumoAcumulado: 232.145, gpd: 0.942 },
  { dia: 101, pesoInicial: 128.478, pesoFinal: 129.410, cmd: 2.980, consumoAcumulado: 235.125, gpd: 0.932 }
];

export const defaultMetas = {
  metaAlojamento: 17.40,
  metaCrescimento1: 32.09,
  metaCrescimento2: 32.09,
  metaCrescimento3: 47.74,
  metaTerminacao1: 28.30,
  metaTerminacao2: 64.51,
  metaAcumulada: 222.13
};
export const growthCurveFemea: GrowthCurvePoint[] = [
  { dia: 1, pesoInicial: 22.000, pesoFinal: 22.680, cmd: 1.029, consumoAcumulado: 1.029, gpd: 0.681 },
  { dia: 2, pesoInicial: 22.680, pesoFinal: 23.370, cmd: 1.051, consumoAcumulado: 2.079, gpd: 0.692 },
  { dia: 3, pesoInicial: 23.370, pesoFinal: 24.080, cmd: 1.073, consumoAcumulado: 3.153, gpd: 0.704 },
  { dia: 4, pesoInicial: 24.080, pesoFinal: 24.790, cmd: 1.095, consumoAcumulado: 4.248, gpd: 0.715 },
  { dia: 5, pesoInicial: 24.790, pesoFinal: 25.520, cmd: 1.117, consumoAcumulado: 5.365, gpd: 0.727 },
  { dia: 6, pesoInicial: 25.520, pesoFinal: 26.260, cmd: 1.139, consumoAcumulado: 6.504, gpd: 0.738 },
  { dia: 7, pesoInicial: 26.260, pesoFinal: 27.010, cmd: 1.161, consumoAcumulado: 7.665, gpd: 0.750 },
  { dia: 8, pesoInicial: 27.010, pesoFinal: 27.770, cmd: 1.183, consumoAcumulado: 8.848, gpd: 0.761 },
  { dia: 9, pesoInicial: 27.770, pesoFinal: 28.540, cmd: 1.204, consumoAcumulado: 10.052, gpd: 0.773 },
  { dia: 10, pesoInicial: 28.540, pesoFinal: 29.320, cmd: 1.226, consumoAcumulado: 11.278, gpd: 0.784 },
  { dia: 11, pesoInicial: 29.320, pesoFinal: 30.120, cmd: 1.247, consumoAcumulado: 12.525, gpd: 0.796 },
  { dia: 12, pesoInicial: 30.120, pesoFinal: 30.930, cmd: 1.269, consumoAcumulado: 13.794, gpd: 0.806 },
  { dia: 13, pesoInicial: 30.930, pesoFinal: 31.740, cmd: 1.290, consumoAcumulado: 15.084, gpd: 0.813 },
  { dia: 14, pesoInicial: 31.740, pesoFinal: 32.560, cmd: 1.311, consumoAcumulado: 16.395, gpd: 0.820 },
  { dia: 15, pesoInicial: 32.560, pesoFinal: 33.440, cmd: 1.486, consumoAcumulado: 17.881, gpd: 0.886 },
  { dia: 16, pesoInicial: 33.440, pesoFinal: 34.340, cmd: 1.511, consumoAcumulado: 19.392, gpd: 0.896 },
  { dia: 17, pesoInicial: 34.340, pesoFinal: 35.240, cmd: 1.535, consumoAcumulado: 20.927, gpd: 0.904 },
  { dia: 18, pesoInicial: 35.240, pesoFinal: 36.160, cmd: 1.560, consumoAcumulado: 22.487, gpd: 0.912 },
  { dia: 19, pesoInicial: 36.160, pesoFinal: 37.080, cmd: 1.584, consumoAcumulado: 24.070, gpd: 0.920 },
  { dia: 20, pesoInicial: 37.080, pesoFinal: 38.000, cmd: 1.607, consumoAcumulado: 25.678, gpd: 0.927 },
  { dia: 21, pesoInicial: 38.000, pesoFinal: 38.940, cmd: 1.631, consumoAcumulado: 27.309, gpd: 0.935 },
  { dia: 22, pesoInicial: 38.940, pesoFinal: 39.880, cmd: 1.654, consumoAcumulado: 28.963, gpd: 0.943 },
  { dia: 23, pesoInicial: 39.880, pesoFinal: 40.830, cmd: 1.677, consumoAcumulado: 30.640, gpd: 0.950 },
  { dia: 24, pesoInicial: 40.830, pesoFinal: 41.790, cmd: 1.700, consumoAcumulado: 32.340, gpd: 0.958 },
  { dia: 25, pesoInicial: 41.790, pesoFinal: 42.750, cmd: 1.723, consumoAcumulado: 34.063, gpd: 0.965 },
  { dia: 26, pesoInicial: 42.750, pesoFinal: 43.730, cmd: 1.745, consumoAcumulado: 35.808, gpd: 0.973 },
  { dia: 27, pesoInicial: 43.730, pesoFinal: 44.710, cmd: 1.767, consumoAcumulado: 37.575, gpd: 0.980 },
  { dia: 28, pesoInicial: 44.710, pesoFinal: 45.690, cmd: 1.789, consumoAcumulado: 39.364, gpd: 0.988 },
  { dia: 29, pesoInicial: 45.690, pesoFinal: 46.730, cmd: 1.954, consumoAcumulado: 41.317, gpd: 1.039 },
  { dia: 30, pesoInicial: 46.730, pesoFinal: 47.780, cmd: 1.978, consumoAcumulado: 43.295, gpd: 1.047 },
  { dia: 31, pesoInicial: 47.780, pesoFinal: 48.830, cmd: 2.002, consumoAcumulado: 45.297, gpd: 1.055 },
  { dia: 32, pesoInicial: 48.830, pesoFinal: 49.900, cmd: 2.025, consumoAcumulado: 47.322, gpd: 1.063 },
  { dia: 33, pesoInicial: 49.900, pesoFinal: 50.950, cmd: 2.049, consumoAcumulado: 49.371, gpd: 1.058 },
  { dia: 34, pesoInicial: 50.950, pesoFinal: 52.020, cmd: 2.072, consumoAcumulado: 51.443, gpd: 1.066 },
  { dia: 35, pesoInicial: 52.020, pesoFinal: 53.090, cmd: 2.094, consumoAcumulado: 53.537, gpd: 1.073 },
  { dia: 36, pesoInicial: 53.090, pesoFinal: 54.170, cmd: 2.117, consumoAcumulado: 55.654, gpd: 1.081 },
  { dia: 37, pesoInicial: 54.170, pesoFinal: 55.260, cmd: 2.139, consumoAcumulado: 57.793, gpd: 1.088 },
  { dia: 38, pesoInicial: 55.260, pesoFinal: 56.360, cmd: 2.161, consumoAcumulado: 59.953, gpd: 1.095 },
  { dia: 39, pesoInicial: 56.360, pesoFinal: 57.460, cmd: 2.182, consumoAcumulado: 62.136, gpd: 1.102 },
  { dia: 40, pesoInicial: 57.460, pesoFinal: 58.570, cmd: 2.204, consumoAcumulado: 64.339, gpd: 1.108 },
  { dia: 41, pesoInicial: 58.570, pesoFinal: 59.680, cmd: 2.225, consumoAcumulado: 66.564, gpd: 1.115 },
  { dia: 42, pesoInicial: 59.680, pesoFinal: 60.800, cmd: 2.246, consumoAcumulado: 68.810, gpd: 1.121 },
  { dia: 43, pesoInicial: 60.800, pesoFinal: 61.920, cmd: 2.306, consumoAcumulado: 71.116, gpd: 1.121 },
  { dia: 44, pesoInicial: 61.920, pesoFinal: 63.050, cmd: 2.326, consumoAcumulado: 73.442, gpd: 1.127 },
  { dia: 45, pesoInicial: 63.050, pesoFinal: 64.180, cmd: 2.347, consumoAcumulado: 75.789, gpd: 1.132 },
  { dia: 46, pesoInicial: 64.180, pesoFinal: 65.320, cmd: 2.367, consumoAcumulado: 78.155, gpd: 1.137 },
  { dia: 47, pesoInicial: 65.320, pesoFinal: 66.460, cmd: 2.386, consumoAcumulado: 80.542, gpd: 1.142 },
  { dia: 48, pesoInicial: 66.460, pesoFinal: 67.610, cmd: 2.406, consumoAcumulado: 82.947, gpd: 1.146 },
  { dia: 49, pesoInicial: 67.610, pesoFinal: 68.760, cmd: 2.425, consumoAcumulado: 85.372, gpd: 1.150 },
  { dia: 50, pesoInicial: 68.760, pesoFinal: 69.910, cmd: 2.443, consumoAcumulado: 87.815, gpd: 1.154 },
  { dia: 51, pesoInicial: 69.910, pesoFinal: 71.070, cmd: 2.462, consumoAcumulado: 90.277, gpd: 1.157 },
  { dia: 52, pesoInicial: 71.070, pesoFinal: 72.230, cmd: 2.480, consumoAcumulado: 92.756, gpd: 1.160 },
  { dia: 53, pesoInicial: 72.230, pesoFinal: 73.390, cmd: 2.497, consumoAcumulado: 95.254, gpd: 1.163 },
  { dia: 54, pesoInicial: 73.390, pesoFinal: 74.560, cmd: 2.515, consumoAcumulado: 97.769, gpd: 1.165 },
  { dia: 55, pesoInicial: 74.560, pesoFinal: 75.730, cmd: 2.532, consumoAcumulado: 100.300, gpd: 1.167 },
  { dia: 56, pesoInicial: 75.730, pesoFinal: 76.890, cmd: 2.549, consumoAcumulado: 102.849, gpd: 1.169 },
  { dia: 57, pesoInicial: 76.890, pesoFinal: 78.190, cmd: 2.525, consumoAcumulado: 105.374, gpd: 1.299 },
  { dia: 58, pesoInicial: 78.190, pesoFinal: 79.490, cmd: 2.543, consumoAcumulado: 107.917, gpd: 1.293 },
  { dia: 59, pesoInicial: 79.490, pesoFinal: 80.770, cmd: 2.560, consumoAcumulado: 110.477, gpd: 1.287 },
  { dia: 60, pesoInicial: 80.770, pesoFinal: 82.050, cmd: 2.576, consumoAcumulado: 113.054, gpd: 1.280 },
  { dia: 61, pesoInicial: 82.050, pesoFinal: 83.330, cmd: 2.593, consumoAcumulado: 115.646, gpd: 1.273 },
  { dia: 62, pesoInicial: 83.330, pesoFinal: 84.590, cmd: 2.608, consumoAcumulado: 118.254, gpd: 1.265 },
  { dia: 63, pesoInicial: 84.590, pesoFinal: 85.850, cmd: 2.623, consumoAcumulado: 120.877, gpd: 1.257 },
  { dia: 64, pesoInicial: 85.850, pesoFinal: 87.100, cmd: 2.638, consumoAcumulado: 123.515, gpd: 1.249 },
  { dia: 65, pesoInicial: 87.100, pesoFinal: 88.340, cmd: 2.652, consumoAcumulado: 126.167, gpd: 1.240 },
  { dia: 66, pesoInicial: 88.340, pesoFinal: 89.570, cmd: 2.666, consumoAcumulado: 128.833, gpd: 1.231 },
  { dia: 67, pesoInicial: 89.570, pesoFinal: 90.760, cmd: 2.607, consumoAcumulado: 131.440, gpd: 1.189 },
  { dia: 68, pesoInicial: 90.760, pesoFinal: 91.940, cmd: 2.620, consumoAcumulado: 134.060, gpd: 1.179 },
  { dia: 69, pesoInicial: 91.940, pesoFinal: 93.100, cmd: 2.631, consumoAcumulado: 136.691, gpd: 1.168 },
  { dia: 70, pesoInicial: 93.100, pesoFinal: 94.260, cmd: 2.642, consumoAcumulado: 139.333, gpd: 1.157 },
  { dia: 71, pesoInicial: 94.260, pesoFinal: 95.410, cmd: 2.653, consumoAcumulado: 141.987, gpd: 1.146 },
  { dia: 72, pesoInicial: 95.410, pesoFinal: 96.540, cmd: 2.664, consumoAcumulado: 144.651, gpd: 1.135 },
  { dia: 73, pesoInicial: 96.540, pesoFinal: 97.670, cmd: 2.674, consumoAcumulado: 147.324, gpd: 1.125 },
  { dia: 74, pesoInicial: 97.670, pesoFinal: 98.780, cmd: 2.684, consumoAcumulado: 150.008, gpd: 1.114 },
  { dia: 75, pesoInicial: 98.780, pesoFinal: 99.880, cmd: 2.693, consumoAcumulado: 152.701, gpd: 1.104 },
  { dia: 76, pesoInicial: 99.880, pesoFinal: 100.980, cmd: 2.702, consumoAcumulado: 155.403, gpd: 1.094 },
  { dia: 77, pesoInicial: 100.980, pesoFinal: 102.060, cmd: 2.711, consumoAcumulado: 158.114, gpd: 1.084 },
  { dia: 78, pesoInicial: 102.060, pesoFinal: 103.130, cmd: 2.719, consumoAcumulado: 160.833, gpd: 1.065 },
  { dia: 79, pesoInicial: 103.130, pesoFinal: 104.170, cmd: 2.727, consumoAcumulado: 163.560, gpd: 1.042 },
  { dia: 80, pesoInicial: 104.170, pesoFinal: 105.190, cmd: 2.735, consumoAcumulado: 166.295, gpd: 1.020 }
];

export const defaultMetasFemea = {
  metaAlojamento: 16.39,
  metaCrescimento1: 22.97,
  metaCrescimento2: 29.45,
  metaCrescimento3: 34.04,
  metaTerminacao1: 25.98,
  metaTerminacao2: 37.46,
  metaAcumulada: 166.29
};
export const getExpectedConsumption = (idade: number, tipoLote?: 'Misto' | 'Fêmea'): number => {
  const curve = tipoLote === 'Fêmea' ? growthCurveFemea : growthCurve;
  // Linear interpolation for exact day
  const exactMatch = curve.find(p => p.dia === idade);
  if (exactMatch) return exactMatch.consumoAcumulado;

  const sorted = [...curve].sort((a, b) => a.dia - b.dia);
  
  if (idade <= sorted[0].dia) return sorted[0].consumoAcumulado;
  if (idade >= sorted[sorted.length - 1].dia) return sorted[sorted.length - 1].consumoAcumulado;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (idade > sorted[i].dia && idade < sorted[i+1].dia) {
      const p1 = sorted[i];
      const p2 = sorted[i+1];
      const ratio = (idade - p1.dia) / (p2.dia - p1.dia);
      return Number((p1.consumoAcumulado + ratio * (p2.consumoAcumulado - p1.consumoAcumulado)).toFixed(2));
    }
  }

  return sorted[0].consumoAcumulado; // Approx
};

export const getExpectedWeight = (idade: number, tipoLote?: 'Misto' | 'Fêmea'): number => {
  const curve = tipoLote === 'Fêmea' ? growthCurveFemea : growthCurve;
  // Linear interpolation for exact day
  const exactMatch = curve.find(p => p.dia === idade);
  if (exactMatch) return exactMatch.pesoInicial;

  const sorted = [...curve].sort((a, b) => a.dia - b.dia);
  
  if (idade <= sorted[0].dia) return sorted[0].pesoInicial;
  if (idade >= sorted[sorted.length - 1].dia) return sorted[sorted.length - 1].pesoInicial;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (idade > sorted[i].dia && idade < sorted[i+1].dia) {
      const p1 = sorted[i];
      const p2 = sorted[i+1];
      const ratio = (idade - p1.dia) / (p2.dia - p1.dia);
      return Number((p1.pesoInicial + ratio * (p2.pesoInicial - p1.pesoInicial)).toFixed(2));
    }
  }

  return sorted[0].pesoInicial; // Approx
};

// Parser
function parsePdfData() {
  const integradosMap = new Map<string, Integrado>();
  const visits: Visit[] = [];
  
  const lines = pdfData.trim().split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(-?\d+)\s+(.+?)\s+(Automático|Linear|Misto|Multitratos|Basculante|Robô|automático com\s+água)\s+([^\d]+)\s+([\d.]+)\s+(\d+)$/i);
    
    if (match) {
      const [, dateStr, name, alojamentoStr, idadeStr, rec, comedouro, colab, consumoStr, mortStr] = match;
      
      const id = `i_${name.replace(/\s+/g, '').toLowerCase()}`;
      if (!integradosMap.has(id)) {
        integradosMap.set(id, {
          id,
          name: name.trim(),
          alojamentoDate: alojamentoStr.split('/').reverse().join('-'), // YYYY-MM-DD
          status: 'Em andamento'
        });
      }
      
      let parsedComedouro = 'Automático';
      if (comedouro.toLowerCase().includes('linear')) parsedComedouro = 'Linear';
      if (comedouro.toLowerCase().includes('misto')) parsedComedouro = 'Misto';
      
      visits.push({
        id: `v_${id}_${index}`,
        integradoId: id,
        date: dateStr.split('/').reverse().join('-'),
        idade: parseInt(idadeStr, 10),
        recomendacao: rec.trim(),
        comedouro: parsedComedouro as 'Automático' | 'Linear' | 'Misto',
        colaborador: colab.trim(),
        consumoAcumuladoReal: parseFloat(consumoStr) || 0,
        mortalidade: parseInt(mortStr, 10) || 0
      });
    }
  });

  return { 
    parsedIntegrados: Array.from(integradosMap.values()), 
    parsedVisits: visits 
  };
}

const { parsedIntegrados, parsedVisits } = parsePdfData();

export const initialIntegrados: Integrado[] = parsedIntegrados.length > 0 ? parsedIntegrados : [
  { id: '1', name: 'Arildo Valcarenghi', alojamentoDate: '2026-03-30', status: 'Em andamento' },
  { id: '2', name: 'Wanderlei Richit', alojamentoDate: '2026-03-23', status: 'Em andamento' }
];

export const initialVisits: Visit[] = parsedVisits.length > 0 ? parsedVisits : [
  {
    id: 'v1', date: '2026-04-28', integradoId: '1', idade: 29, 
    recomendacao: 'Consumo acumulado 49,83 kg e tabela 51,36 kg',
    comedouro: 'Automático', colaborador: 'Wagner', consumoAcumuladoReal: 49.83, mortalidade: 0.12
  }
];
