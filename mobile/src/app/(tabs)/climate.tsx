import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Bar, Body, BrandHeader, Card, Icon, IconName, Pill, Row, Screen, Slider, Txt } from '../../components/ui';
import { stressBand } from '../../data/climate';
import { Climate, getRepository } from '../../data/repository';
import { useLang } from '../../i18n';
import { colors, radius } from '../../theme';

const terraces = require('../../../assets/photos/terraces.jpg');

const zones = [
  { z: 'Zone A', v: '0.82', n: 'High Vigor', s: 'Vigor', l: 'Excellent', dot: '#0E9F6E', ink: colors.secondary },
  { z: 'Zone B', v: '0.74', n: 'Optimal', s: 'Canopy', l: 'Healthy', dot: '#84CC16', ink: colors.primary },
  { z: 'Zone C', v: '0.58', n: 'Stress Alert', s: 'Stress', l: 'Attention', dot: '#F59E0B', ink: '#B45309' },
];

const sensors: { t: string; icon: IconName; iconColor: string; v: string; unit?: string; sub: string; sub2?: string; bar?: number; barColor?: string }[] = [
  { t: 'Temperature', icon: 'thermometer', iconColor: colors.gold, v: '26.4°C', sub: 'High 29° • Low 16°', bar: 66, barColor: colors.gold },
  { t: 'Soil Moisture (40cm)', icon: 'water-outline', iconColor: colors.primary, v: '31%', sub: 'Stable (Root Zone)', bar: 58, barColor: colors.primary },
  { t: 'Rainfall (Month)', icon: 'weather-pouring', iconColor: colors.secondary, v: '12 mm', sub: 'Seasonal: 420mm (88%)', sub2: '-12% vs. Historic Avg' },
  { t: 'Wind Speed', icon: 'weather-windy', iconColor: colors.faint, v: '11', unit: 'km/h', sub: 'WNW • Gentle Breeze', sub2: 'Evapotranspiration: Low' },
];

export default function ClimateScreen() {
  const { rowDir, pick, tr } = useLang();
  const [c, setC] = useState<Climate | null>(null);
  const [tab, setTab] = useState(0);
  const [shift, setShift] = useState(2);
  const [deficit, setDeficit] = useState(25);
  useEffect(() => getRepository().subscribeClimate(setC), []);
  const band = c ? stressBand(c.csi) : null;

  return (
    <Screen>
      <BrandHeader right={<Icon name="bell-outline" size={24} color={colors.primary} />} />
      <Body pad={0}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 4 }}>
          <Txt size={25} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 32 }}>
            Climate & Satellite Watch
          </Txt>
          <Txt size={13} color={colors.muted} ar>
            المراقبة الفضائية والمناخية للزيتون
          </Txt>
        </View>

        <Row style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: colors.low, borderRadius: radius.card, padding: 12, justifyContent: 'space-between' }}>
          <Row style={{ gap: 10 }}>
            <Icon name="map-marker" size={22} color={colors.primary} />
            <View>
              <Txt size={14} face="labelBold" color={colors.primary} style={{ lineHeight: 18 }}>Deir Istiya, Salfit</Txt>
              <Txt size={12} color={colors.muted} style={{ lineHeight: 16 }}>دير استيا، سلفيت</Txt>
            </View>
          </Row>
          <Row style={{ gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Icon name="satellite-variant" size={20} color={colors.primaryContainer} />
            <View>
              <Txt size={13} face="labelBold" color={colors.secondary} style={{ lineHeight: 17 }}>Sentinel-2</Txt>
              <Txt size={11} face="label" color={colors.faint} style={{ lineHeight: 14 }}>4h ago</Txt>
            </View>
          </Row>
        </Row>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 16 }}>
          {/* NDVI spectral view */}
          <Card style={{ gap: 12 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Row style={{ gap: 10, flex: 1 }}>
                <Icon name="map-outline" size={22} color={colors.primary} />
                <Txt size={16} face="label" color={colors.primary} style={{ flex: 1 }}>Terraced Grove NDVI Spectral View</Txt>
              </Row>
              <Pill label="Plot #14-B" face="labelBold" size={12} />
            </Row>
            <Row style={{ backgroundColor: colors.raised, borderRadius: 14, padding: 4 }}>
              {['NDVI Health', 'NDWI Moisture', 'Canopy Temp'].map((t, i) => (
                <Pressable
                  key={t}
                  onPress={() => setTab(i)}
                  style={{ flex: 1, height: 48, borderRadius: 10, backgroundColor: tab === i ? colors.primaryContainer : 'transparent', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Txt size={11} face="labelBold" color={tab === i ? colors.white : colors.muted} style={{ textAlign: 'center' }}>{t}</Txt>
                </Pressable>
              ))}
            </Row>
            <View style={{ height: 206, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.raised }}>
              <Image source={terraces} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              {[
                { z: zones[0], style: { top: 16, left: 12 } },
                { z: zones[2], style: { top: 34, right: 10 } },
                { z: zones[1], style: { bottom: 38, left: 40 } },
              ].map(({ z, style }) => (
                <View key={z.z} style={[{ position: 'absolute', backgroundColor: 'rgba(245,251,240,0.94)', borderRadius: 10, borderWidth: 1, borderColor: colors.outline, paddingHorizontal: 10, paddingVertical: 5 }, style]}>
                  <Row style={{ gap: 6, justifyContent: 'flex-start' }}>
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: z.dot }} />
                    <Txt size={12} face="labelBold" color={colors.primary}>{z.z}</Txt>
                  </Row>
                  <Txt size={11} face="labelBold" color={z.ink}>{`${z.v} • ${tr(z.n)}`}</Txt>
                </View>
              ))}
              <View style={{ position: 'absolute', right: 8, bottom: 8, backgroundColor: 'rgba(222,228,218,0.9)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Txt size={10} face="label" color={colors.muted}>32°07'N 35°08'E</Txt>
              </View>
            </View>
            <Row style={{ gap: 8 }}>
              {zones.map((z) => (
                <View key={z.z} style={{ flex: 1, backgroundColor: colors.low, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 10, alignItems: 'center', gap: 2 }}>
                  <Row style={{ gap: 6 }}>
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: z.dot }} />
                    <Txt size={13} face="labelBold" color={colors.primary}>{z.z}</Txt>
                  </Row>
                  <Txt size={12} face="label" color={colors.muted}>{`${z.v} ${tr(z.s)}`}</Txt>
                  <Txt size={11} face="labelBold" color={z.ink}>{z.l}</Txt>
                </View>
              ))}
            </Row>
          </Card>

          {/* Microclimate sensor array */}
          <Card style={{ gap: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt size={11} face="labelBold" color={colors.secondary} style={{ lineHeight: 14 }}>70</Txt>
                </View>
                <View>
                  <Txt size={16} face="labelBold" color={colors.primary} style={{ lineHeight: 21 }}>Microclimate Sensor Array</Txt>
                  <Txt size={11} face="label" color={colors.muted} style={{ lineHeight: 15 }}>Telemetry Station #04 • Terraces</Txt>
                </View>
              </Row>
              <Row style={{ gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary }} />
                <Txt size={12} face="labelBold" color={colors.secondary}>Live</Txt>
              </Row>
            </Row>
            <View style={{ flexDirection: rowDir, flexWrap: 'wrap', gap: 10 }}>
              {sensors.map((s) => (
                <View key={s.t} style={{ width: '48%', flexGrow: 1, backgroundColor: colors.low, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, gap: 4 }}>
                  <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Txt size={12} face="label" color={colors.muted} style={{ flex: 1 }}>{s.t}</Txt>
                    <Icon name={s.icon} size={20} color={s.iconColor} />
                  </Row>
                  <Row style={{ gap: 4, alignItems: 'baseline' }}>
                    <Txt size={24} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 30 }}>{s.v}</Txt>
                    {s.unit ? <Txt size={13} face="jakarta" color={colors.primary}>{s.unit}</Txt> : null}
                  </Row>
                  <Txt size={11} face="label" color={s.bar ? colors.muted : colors.muted}>{s.sub}</Txt>
                  {s.bar ? <Bar value={s.bar} color={s.barColor} /> : null}
                  {s.sub2 ? (
                    <Row style={{ gap: 4, justifyContent: 'flex-start' }}>
                      {s.sub2.startsWith('-') ? <Icon name="trending-down" size={14} color={colors.secondary} /> : null}
                      <Txt size={11} face="label" color={s.sub2.startsWith('-') ? colors.secondary : colors.muted}>{s.sub2}</Txt>
                    </Row>
                  ) : null}
                </View>
              ))}
            </View>
          </Card>

          {/* Climate Stress Index, recomputed from the stored inputs */}
          {c && band ? (
            <Card style={{ gap: 10 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt size={15} weight="bold" color={colors.primary}>مؤشر الإجهاد المناخي • CSI</Txt>
                <Pill label={band.label} bg={band.band === 'low' ? colors.secondaryContainer : band.band === 'medium' ? '#FBE3C4' : colors.errorContainer} ink={band.band === 'high' ? colors.error : colors.primary} />
              </Row>
              <Row style={{ gap: 6, alignItems: 'baseline', justifyContent: 'flex-start' }}>
                <Txt size={32} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 38 }}>{c.csi.toFixed(1)}</Txt>
                <Txt size={14} face="jakarta" color={colors.muted}>/ 100</Txt>
              </Row>
              <Bar value={c.csi} color={band.band === 'high' ? colors.error : band.band === 'medium' ? colors.gold : colors.secondary} />
              <Txt size={12} face="label" color={colors.muted}>{pick(`ارتفاع الحرارة +${c.dT}°م • فرق الأمطار ${c.dP} ملم • ${c.dryDays} أيام جفاف • مقارنة بمتوسط ${c.baseline} • NASA POWER (ناسا باور)`, `ΔT +${c.dT}°C • ΔP ${c.dP} mm • ${c.dryDays} dry days • vs ${c.baseline} • ${c.provider}`)}</Txt>
            </Card>
          ) : null}

          {/* Climate risk simulator */}
          <View style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.outline, borderRadius: radius.card, padding: 16, gap: 14 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Row style={{ gap: 10, flex: 1 }}>
                <Icon name="tune-variant" size={26} color={colors.gold} />
                <View style={{ flex: 1 }}>
                  <Txt size={17} face="labelBold" color={colors.primary} style={{ lineHeight: 22 }}>Climate Risk Simulator</Txt>
                  <Txt size={12} color={colors.muted} ar>سيموليتر التغير المناخي للمزارع الفلسطيني</Txt>
                </View>
              </Row>
              <View style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Txt size={11} face="labelBold" color={colors.white} style={{ lineHeight: 15 }}>AI Prognosis</Txt>
              </View>
            </Row>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View style={{ gap: 4 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Row style={{ gap: 8 }}>
                  <Icon name="white-balance-sunny" size={20} color={colors.gold} />
                  <Txt size={14} face="labelBold" color={colors.primary}>Temperature Shift</Txt>
                </Row>
                <View style={{ backgroundColor: colors.raised, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 3 }}>
                  <Txt size={14} face="labelBold" color={colors.primary}>{pick(`+${shift.toFixed(1)}°م`, `+${shift.toFixed(1)}°C`)}</Txt>
                </View>
              </Row>
              <Slider value={shift} min={0} max={4.5} step={0.5} onChange={setShift} />
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt size={11} face="label" color={colors.muted}>Current Norm</Txt>
                <Txt size={11} face="label" color={colors.muted}>+2.0°C (IPCC Mid)</Txt>
                <Txt size={11} face="label" color={colors.muted}>+4.5°C Severe</Txt>
              </Row>
            </View>
            <View style={{ gap: 4 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Row style={{ gap: 8 }}>
                  <Icon name="water-outline" size={20} color={colors.primaryContainer} />
                  <Txt size={14} face="labelBold" color={colors.primary}>Rainfall Deficit</Txt>
                </Row>
                <View style={{ backgroundColor: '#FFF6E0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 3 }}>
                  <Txt size={14} face="labelBold" color={colors.tertiaryContainer}>{`-${deficit}%`}</Txt>
                </View>
              </Row>
              <Slider value={deficit} min={0} max={50} step={5} onChange={setDeficit} />
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt size={11} face="label" color={colors.muted}>Normal (0%)</Txt>
                <Txt size={11} face="label" color={colors.muted}>-25% Deficit</Txt>
                <Txt size={11} face="label" color={colors.muted}>-50% Drought</Txt>
              </Row>
            </View>

            <View style={{ backgroundColor: colors.low, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, gap: 10 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Row style={{ gap: 8 }}>
                  <Icon name="chart-box-outline" size={20} color={colors.primary} />
                  <Txt size={13} face="labelBold" color={colors.primary}>Projected Impact on Grove</Txt>
                </Row>
                <Txt size={11} face="labelBold" color={colors.secondary}>Nabali Baladi Variety</Txt>
              </Row>
              <Row style={{ gap: 10, alignItems: 'flex-start' }}>
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 10, gap: 3 }}>
                  <Txt size={12} face="label" color={colors.muted}>Flowering & Fruit Set</Txt>
                  <Txt size={19} face="jakartaExtra" color={colors.error} style={{ lineHeight: 25 }}>-18% Risk</Txt>
                  <Txt size={11} face="label" color={colors.muted}>High heat desiccation window during May bloom.</Txt>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 10, gap: 3 }}>
                  <Txt size={12} face="label" color={colors.muted}>Oil Quality Profile</Txt>
                  <Txt size={19} face="jakartaExtra" color={colors.secondary} style={{ lineHeight: 25 }}>+12% Polyphenol</Txt>
                  <Txt size={11} face="label" color={colors.muted}>Higher bitterness; acidity holds stable &lt;0.4% EVOO.</Txt>
                </View>
              </Row>
              <Row style={{ gap: 8, backgroundColor: '#E6F0D2', borderRadius: 12, padding: 10, alignItems: 'flex-start' }}>
                <Icon name="leaf" size={18} color={colors.secondary} />
                <Txt size={12} face="latin" color={colors.primary} style={{ flex: 1, lineHeight: 18 }}>
                  <Txt size={12} face="jakarta" color={colors.primary}>Agronomic Adaptation Advice: </Txt>
                  Switch to deficit drip irrigation during August and apply organic kaolin clay spray to reduce tree transpiration.
                </Txt>
              </Row>
            </View>
            <Row style={{ gap: 6, alignItems: 'flex-start' }}>
              <Icon name="information-outline" size={16} color={colors.faint} />
              <Txt size={11} face="label" color={colors.faint} style={{ flex: 1, lineHeight: 16 }}>
                Simulation model based on regional agro-climatic projections for Mediterranean olive basins. Not a guaranteed yield forecast.
              </Txt>
            </Row>
          </View>
        </View>
      </Body>
    </Screen>
  );
}
