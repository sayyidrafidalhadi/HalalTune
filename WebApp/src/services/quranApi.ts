const BASE = "https://api.alquran.cloud/v1"

export interface AyahData {
  number: number
  numberInSurah: number
  text: string
  translation: string
  audioUrl: string
}

export interface SurahDetail {
  number: number
  name: string
  arabicName: string
  englishName: string
  revelationType: string
  numberOfAyahs: number
  ayahs: AyahData[]
}

const RECITER_MAP: Record<string, string> = {
  mishary: "ar.alafasy",
  sudais: "ar.abdurrahmaansudais",
  ghamidi: "ar.shaatree",
  dosari: "ar.mahermuaiqly",
  muaiqly: "ar.mahermuaiqly",
  shatri: "ar.shaatree",
  husary: "ar.husary",
  ayyub: "ar.muhammadayyoub",
  basit: "ar.abdulbasitmurattal",
  minshawi: "ar.minshawi",
}

export function getReciterApiId(reciterId: string): string {
  return RECITER_MAP[reciterId] || "ar.alafasy"
}

export function getAyahAudioUrl(reciterId: string, ayahNumber: number): string {
  const apiId = getReciterApiId(reciterId)
  return `https://cdn.islamic.network/quran/audio/128/${apiId}/${ayahNumber}.mp3`
}

export async function fetchSurah(surahNumber: number): Promise<{ number: number; name: string; englishName: string; revelationType: string; numberOfAyahs: number; ayahs: { number: number; numberInSurah: number; text: string }[] }> {
  const res = await fetch(`${BASE}/surah/${surahNumber}`)
  if (!res.ok) throw new Error("Failed to fetch surah")
  const json = await res.json()
  return json.data
}

export async function fetchTranslation(surahNumber: number, translation = "en.sahih"): Promise<{ ayahs: { number: number; text: string }[] }> {
  const res = await fetch(`${BASE}/surah/${surahNumber}/${translation}`)
  if (!res.ok) throw new Error("Failed to fetch translation")
  const json = await res.json()
  return json.data
}

export async function fetchSurahDetail(surahNumber: number, reciterId: string): Promise<SurahDetail> {
  const [surahRes, translationRes] = await Promise.all([
    fetchSurah(surahNumber),
    fetchTranslation(surahNumber),
  ])

  const apiId = getReciterApiId(reciterId)

  // Parse Arabic name from the API
  const nameParts = surahRes.name.split(" ")
  const arabicName = nameParts.slice(1).join(" ").replace(/[()]/g, "") || surahRes.name

  return {
    number: surahRes.number,
    name: surahRes.englishName,
    arabicName,
    englishName: surahRes.englishName,
    revelationType: surahRes.revelationType,
    numberOfAyahs: surahRes.numberOfAyahs,
    ayahs: surahRes.ayahs.map((ayah) => {
      const translation = translationRes.ayahs.find((t) => t.number === ayah.number)
      return {
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: translation?.text || "",
        audioUrl: `https://cdn.islamic.network/quran/audio/128/${apiId}/${ayah.number}.mp3`,
      }
    }),
  }
}
