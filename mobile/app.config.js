// Same config as app.json. Only when EXPO_BASE_URL is set (scripts/build-web.mjs sets it to "/app") the web build is
// served from that sub-path, so the phone-frame page can live at "/". Development and the native apps are unchanged.
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_BASE_URL;
  if (!baseUrl) return config;
  return { ...config, experiments: { ...config.experiments, baseUrl } };
};
