import consola from 'consola'
import { nanoid } from 'nanoid'

// ----------------------------------------------------------------
//                          类型定义
// ----------------------------------------------------------------

export interface WordItem {
  word: string
  prompts: string[]
}

/**
 * 词库元数据 (列表展示用)
 */
export interface LibraryMeta {
  id: string
  name: string
  description: string
  authorId: string
  tags?: string[] // 比如 ['简单', '成语']
  createdAt: number
  updatedAt: number
}

/**
 * 完整词库结构 (存储用)
 */
export interface WordLibrary extends LibraryMeta {
  editorIds: string[] // 有权编辑的用户 ID 列表
  words: WordItem[]
}

const logger = consola.withTag('Word Service')

// ----------------------------------------------------------------
//                          常量与存储
// ----------------------------------------------------------------

const STORAGE_KEY_PREFIX = 'lib:'
const INDEX_KEY = 'sys:index'
const DEFAULT_LIB_ID = 'default-official'

// ----------------------------------------------------------------
//                          核心逻辑
// ----------------------------------------------------------------
const storage = useStorage('word')

export const useWordManager = () => {
  /**
   * 0. 初始化默认词库
   * 如果系统中没有任何词库，则创建一个官方默认词库
   */
  const initDefaultLibrary = async () => {
    const index = await getLibraryIndex()

    // 如果索引为空，或者默认ID不在索引中 (防止索引丢失但数据还在的情况，做个双重检查)
    const hasDefault = await storage.hasItem(`${STORAGE_KEY_PREFIX}${DEFAULT_LIB_ID}`)

    if (index.length === 0 || !hasDefault) {
      logger.log('词库为空，初始化默认词库...')

      const defaultWords: WordItem[] = [
        { word: '苹果', prompts: ['水果', '红色', '乔布斯'] },
        { word: '奥特曼', prompts: ['打怪兽', '光', 'M78星云'] },
        { word: '程序员', prompts: ['写代码', '秃头', '格子衫'] },
        { word: '爆浆蟑螂', prompts: ['美食', '特别好吃', '咬开会爆浆'] },
        { word: '奶龙', prompts: ['卡通角色', '黄颜色的', '像鼻涕泡一样'] },
        { word: '叮咚鸡', prompts: ['卡通角色', '白颜色的', '设定是一种鸡'] },
        { word: '哪吒', prompts: ['卡通角色', '穿红背心', '曾经大闹东海'] },
        { word: '玉桂狗', prompts: ['卡通角色', '是一只狗', '有两个大耳朵'] },
        { word: '电棍', prompts: ['知名人物', '前LPL职业选手', '母亲没了'] },
        { word: '东北雨姐', prompts: ['知名人物', '穿大花棉袄', '脚很带派'] },
        { word: '吴京', prompts: ['知名人物', '武打演员', '很爱国'] },
        { word: '毒液', prompts: ['漫威超级英雄', '一坨黑色', '寄生在人身上'] },
        { word: '永雏塔菲', prompts: ['虚拟主播', '粉毛', '唐氏综合征'] },
        { word: '丫丫', prompts: ['动物', '黑白相间', '刚从美国回来'] },
        { word: '圆头耄耋', prompts: ['动物', '生气会哈人', '是一只橘猫'] },
        { word: '测试词', prompts: ['测试提示1', '测试提示2', '测试提示3'] }
      ]

      const defaultLib: WordLibrary = {
        id: DEFAULT_LIB_ID,
        name: '官方默认词库',
        description: '系统内置的基础词汇，包含生活常见物品。',
        authorId: 'system',
        editorIds: [],
        words: defaultWords,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      await _saveLibrary(defaultLib)
      await _addToIndex(DEFAULT_LIB_ID)
    } else {
      logger.log(`词库已加载：${index.length} 个合集`)
    }
  }

  /**
   * 1. 创建新词库
   */
  const createLibrary = async (
    meta: { name: string; description?: string; authorId: string },
    initialWords: WordItem[] = []
  ): Promise<string> => {
    const id = nanoid(10) // 生成短 ID
    const newLib: WordLibrary = {
      id,
      name: meta.name,
      description: meta.description || '',
      authorId: meta.authorId,
      editorIds: [meta.authorId], // 作者默认是编辑者
      words: initialWords,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    await _saveLibrary(newLib)
    await _addToIndex(id)
    return id
  }

  /**
   * 编辑词库元数据 (改名、改描述)
   */
  const updateLibraryMeta = async (
    id: string,
    updates: Partial<Omit<LibraryMeta, 'id' | 'createdAt'>>
  ) => {
    const lib = await getLibraryById(id)
    if (!lib) throw new Error('词库不存在')

    const updatedLib = {
      ...lib,
      ...updates,
      updatedAt: Date.now()
    }
    await _saveLibrary(updatedLib)
  }

  /**
   * 删除词库
   */
  const deleteLibrary = async (id: string) => {
    if (id === DEFAULT_LIB_ID) throw new Error('无法删除默认词库')

    await storage.removeItem(`${STORAGE_KEY_PREFIX}${id}`)
    await _removeFromIndex(id)
  }

  /**
   * 1.1 管理词汇: 添加/覆盖词汇
   */
  const setWords = async (libId: string, words: WordItem[]) => {
    const lib = await getLibraryById(libId)
    if (!lib) throw new Error('词库不存在')

    lib.words = words
    lib.updatedAt = Date.now()
    await _saveLibrary(lib)
  }

  /**
   * 1.2 管理词汇: 追加单个词汇
   */
  const addWord = async (libId: string, word: WordItem) => {
    const lib = await getLibraryById(libId)
    if (!lib) throw new Error('词库不存在')

    // 简单查重
    if (lib.words.some((w) => w.word === word.word)) {
      throw new Error('该词汇已存在于词库中')
    }

    lib.words.push(word)
    lib.updatedAt = Date.now()
    await _saveLibrary(lib)
  }

  /**
   * 2. 随机选取词汇
   * @param libIds 指定从哪些词库中随机 (如果不传，则从所有词库中随机)
   */
  const pickWord = async (libIds?: string[]): Promise<WordItem | null> => {
    let targetLibIds = libIds

    // 如果未指定，则获取所有 ID
    if (!targetLibIds || targetLibIds.length === 0) {
      targetLibIds = await getLibraryIndex()
    }

    if (targetLibIds.length === 0) return null

    // 策略：先随机选一个库，再从库里随机选一个词
    // (这种策略比起“把所有词合并再随机”性能更好，不需要加载所有数据)
    const randomLibId = targetLibIds[Math.floor(Math.random() * targetLibIds.length)]
    const lib = await getLibraryById(randomLibId)

    if (!lib || lib.words.length === 0) {
      // 如果运气不好选到了空库，递归重试（或者简单返回 null）
      // 为防止死循环，实际业务建议做更复杂的池化处理，这里简单处理：
      if (targetLibIds.length > 1) {
        const remainingIds = targetLibIds.filter((id) => id !== randomLibId)
        return pickWord(remainingIds)
      }
      return null
    }

    const randomWord = lib.words[Math.floor(Math.random() * lib.words.length)]
    return randomWord
  }

  // ----------------------------------------------------------------
  //                          辅助 Getter
  // ----------------------------------------------------------------

  const getLibraryIndex = async (): Promise<string[]> => {
    const list = await storage.getItem(INDEX_KEY)
    return (list as string[]) || []
  }

  const getLibraryById = async (id: string): Promise<WordLibrary | null> => {
    const data = await storage.getItem(`${STORAGE_KEY_PREFIX}${id}`)
    return (data as WordLibrary) || null
  }

  // ----------------------------------------------------------------
  //                          私有 Helper
  // ----------------------------------------------------------------

  const _saveLibrary = async (lib: WordLibrary) => {
    await storage.setItem(`${STORAGE_KEY_PREFIX}${lib.id}`, lib)
  }

  const _addToIndex = async (id: string) => {
    const list = await getLibraryIndex()
    if (!list.includes(id)) {
      list.push(id)
      await storage.setItem(INDEX_KEY, list)
    }
  }

  const _removeFromIndex = async (id: string) => {
    const list = await getLibraryIndex()
    const newList = list.filter((i) => i !== id)
    await storage.setItem(INDEX_KEY, newList)
  }

  return {
    initDefaultLibrary,
    createLibrary,
    updateLibraryMeta,
    deleteLibrary,
    setWords,
    addWord,
    pickWord,
    getLibraryIndex,
    getLibraryById
  }
}
