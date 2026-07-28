import { redirect } from 'next/navigation'
import { getSceneOperations } from '@/lib/scene-store-server'
import Home from '../page'

export const dynamic = 'force-dynamic'

export default async function LivePage() {
  const sceneId = process.env.PASCAL_HOME_SCENE_ID?.trim()
  if (sceneId) {
    const operations = await getSceneOperations()
    const scene = await operations.loadStoredScene(sceneId)
    if (scene) {
      redirect(`/scene/${encodeURIComponent(scene.id)}`)
    }
  }

  return <Home />
}
