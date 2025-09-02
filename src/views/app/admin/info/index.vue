<template>
  <AdminPageWrapper title="应用管理">
    <!-- 搜索表单 -->
    <template #searchForm>
      <a-form :model="searchForm" layout="inline" @finish="handleSearch" @reset="handleReset">
        <a-form-item label="应用ID" name="id">
          <a-input v-model:value="searchForm.id" placeholder="请输入应用ID" style="width: 150px" />
        </a-form-item>

        <a-form-item label="应用名称" name="name">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入应用名称"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="代码生成类型" name="codeGenType">
          <a-select
            v-model:value="searchForm.codeGenType"
            placeholder="请选择类型"
            style="width: 150px"
            allow-clear
          >
            <a-select-option v-for="item in codeGenTypeList" :key="item.key" :value="item.key">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="用户ID" name="userId">
          <a-input
            v-model:value="searchForm.userId"
            placeholder="请输入用户ID"
            style="width: 150px"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="loading">
              <SearchOutlined /> 搜索
            </a-button>
            <a-button html-type="reset"> <ReloadOutlined /> 重置 </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </template>

    <!-- 应用列表 -->
    <template #default>
      <a-table
        :columns="columns"
        :data-source="appList"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cover'">
            <div class="app-cover">
              <a-image
                v-if="record.cover"
                :src="record.cover"
                :width="60"
                :height="40"
                :preview="true"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                style="object-fit: cover; border-radius: 4px"
              />
              <div v-else class="no-cover">
                <FileImageOutlined style="font-size: 24px; color: #ccc" />
              </div>
            </div>
          </template>

          <template v-if="column.key === 'codeGenType'">
            <a-tag :color="getCodeGenTypeColor(record.codeGenType)">
              {{ record.codeGenType }}
            </a-tag>
          </template>

          <template v-if="column.key === 'deployStatus'">
            <a-tag :color="record.deployTime ? 'green' : 'orange'">
              {{ record.deployTime ? '已部署' : '未部署' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ record.priority }}
            </a-tag>
          </template>

          <template v-if="column.key === 'userInfo'">
            <div v-if="record.userInfo" class="user-info">
              <div>{{ record.userInfo.name || record.userInfo.account }}</div>
              <div class="user-id">ID: {{ record.userInfo.id }}</div>
            </div>
            <span v-else>-</span>
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewApp(record)"> 查看 </a-button>
              <a-button type="link" size="small" @click="editApp(record)"> 编辑 </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </template>

    <!-- 应用详情模态框 -->
    <template #modals>
      <a-modal v-model:open="appDetailVisible" title="应用详情" width="800px" :footer="null">
        <div v-if="currentApp" class="app-detail">
          <!-- 应用基本信息 -->
          <div class="app-header-section">
            <div class="app-cover-large">
              <a-image
                v-if="currentApp.cover"
                :src="currentApp.cover"
                :width="120"
                :height="80"
                :preview="true"
                style="object-fit: cover; border-radius: 8px"
              />
              <div v-else class="no-cover-large">
                <FileImageOutlined style="font-size: 48px; color: #ccc" />
              </div>
            </div>
            <div class="app-basic-info">
              <h3>{{ currentApp.name }}</h3>
              <p class="app-id">ID: {{ currentApp.id }}</p>
              <div class="app-tags">
                <a-tag :color="getCodeGenTypeColor(currentApp.codeGenType)">
                  {{ currentApp.codeGenType }}
                </a-tag>
                <a-tag :color="currentApp.deployTime ? 'green' : 'orange'">
                  {{ currentApp.deployTime ? '已部署' : '未部署' }}
                </a-tag>
                <a-tag :color="getPriorityColor(currentApp.priority)">
                  {{ currentApp.priority }}
                </a-tag>
              </div>
            </div>
          </div>

          <!-- 初始提示 -->
          <div class="app-prompt-section" v-if="currentApp.initPrompt">
            <h4>初始提示</h4>
            <div class="app-prompt">{{ currentApp.initPrompt }}</div>
          </div>

          <!-- 详细信息 -->
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="应用ID">{{ currentApp.id }}</a-descriptions-item>
            <a-descriptions-item label="应用名称">{{ currentApp.name }}</a-descriptions-item>
            <a-descriptions-item label="代码生成类型">{{
              currentApp.codeGenType
            }}</a-descriptions-item>
            <a-descriptions-item label="优先级">{{ currentApp.priority }}</a-descriptions-item>
            <a-descriptions-item label="部署密钥">{{
              currentApp.deployKey || '未设置'
            }}</a-descriptions-item>
            <a-descriptions-item label="部署时间">{{
              currentApp.deployTime || '未部署'
            }}</a-descriptions-item>
            <a-descriptions-item label="创建者" v-if="currentApp.userInfo">
              {{ currentApp.userInfo.name || currentApp.userInfo.account }}
            </a-descriptions-item>
            <a-descriptions-item label="用户ID" v-if="currentApp.userInfo">
              {{ currentApp.userInfo.id }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间" :span="2">
              {{ currentApp.createTime }}
            </a-descriptions-item>
            <a-descriptions-item label="更新时间" :span="2">
              {{ currentApp.updateTime }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </a-modal>

      <!-- 编辑应用模态框 -->
      <a-modal
        v-model:open="editAppVisible"
        title="编辑应用信息"
        width="600px"
        @ok="handleUpdateApp"
        :confirm-loading="updateLoading"
      >
        <a-form :model="editForm" layout="vertical" ref="editFormRef">
          <a-form-item
            label="应用名称"
            name="name"
            :rules="[{ required: true, message: '请输入应用名称' }]"
          >
            <a-input v-model:value="editForm.name" placeholder="请输入应用名称" />
          </a-form-item>

          <a-form-item label="应用封面" name="cover">
            <a-input v-model:value="editForm.cover" placeholder="请输入封面图片URL" />
            <div class="form-tip">请输入有效的图片URL地址</div>
            <div v-if="editForm.cover" class="cover-preview">
              <a-image
                :src="editForm.cover"
                :width="120"
                :height="80"
                :preview="true"
                style="object-fit: cover; border-radius: 4px; margin-top: 8px"
              />
            </div>
          </a-form-item>

          <a-form-item label="部署密钥" name="deployKey">
            <a-input v-model:value="editForm.deployKey" placeholder="请输入部署密钥" />
            <div class="form-tip">用于应用部署的唯一标识</div>
          </a-form-item>

          <a-form-item label="优先级" name="priority">
            <a-input-number
              v-model:value="editForm.priority"
              placeholder="请输入优先级数字"
              :min="0"
              style="width: 100%"
            />
            <div class="form-tip">请输入数字，0为最低优先级</div>
          </a-form-item>
        </a-form>
      </a-modal>
    </template>
  </AdminPageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, FileImageOutlined } from '@ant-design/icons-vue'
import { getInfo1, getList1, update1 } from '@/api/adminAppController.ts'
import type { TableColumnsType, TableProps, FormInstance } from 'ant-design-vue'
import { useEnumStore } from '@/stores/enum.ts'
import AdminPageWrapper from '@/components/AdminPageWrapper.vue'

// 代码生成类型列表
const codeGenTypeList = ref<API.KeyValueResVo[]>([])

// 搜索表单
const searchForm = reactive<API.AppQueryReqVo>({
  pageNo: 1,
  pageSize: 10,
  orderBy: 'desc',
  id: undefined,
  name: undefined,
  codeGenType: undefined,
  userId: undefined,
})

// 应用列表数据
const appList = ref<API.AppInfoAdminResVo[]>([])
const loading = ref(false)
const total = ref(0)

// 分页配置
const pagination = computed(() => ({
  current: searchForm.pageNo,
  pageSize: searchForm.pageSize,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
}))

// 表格列配置
const columns: TableColumnsType = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '封面',
    dataIndex: 'cover',
    key: 'cover',
    width: 80,
  },
  {
    title: '应用名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: '代码类型',
    dataIndex: 'codeGenType',
    key: 'codeGenType',
    width: 100,
  },
  {
    title: '部署状态',
    dataIndex: 'deployTime',
    key: 'deployStatus',
    width: 100,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80,
  },
  {
    title: '创建者',
    dataIndex: 'userInfo',
    key: 'userInfo',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
]

// 应用详情
const appDetailVisible = ref(false)
const currentApp = ref<API.AppInfoAdminResVo | null>(null)

// 编辑应用
const editAppVisible = ref(false)
const updateLoading = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive<API.AppUpdateAdminReqVo>({
  id: '',
  name: undefined,
  cover: undefined,
  deployKey: undefined,
  priority: undefined,
})

let enumStore = useEnumStore()

/**
 * 获取代码生成类型列表
 */
const getCodeGenTypes = async () => {
  try {
    codeGenTypeList.value = await enumStore.loadCodeGenTypeList()
  } catch (error) {
    console.error('获取代码生成类型失败:', error)
  }
}

/**
 * 获取应用列表
 */
const getAppList = async () => {
  try {
    loading.value = true
    const res = await getList1({
      queryReqVo: searchForm,
    })

    if (res.data?.data) {
      appList.value = res.data.data.list || []
      total.value = Number(res.data.data.totalRow) || 0
    }
  } catch (error) {
    console.error('获取应用列表失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  searchForm.pageNo = 1
  getAppList()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    pageNo: 1,
    pageSize: 10,
    id: undefined,
    name: undefined,
    codeGenType: undefined,
    userId: undefined,
  })
  getAppList()
}

/**
 * 表格变化处理
 */
const handleTableChange: TableProps['onChange'] = (pag) => {
  if (pag) {
    searchForm.pageNo = pag.current || 1
    searchForm.pageSize = pag.pageSize || 10
    getAppList()
  }
}

/**
 * 查看应用详情
 */
const viewApp = async (app: API.AppInfoAdminResVo) => {
  try {
    const res = await getInfo1({ id: app.id! })
    if (res.data?.data) {
      currentApp.value = res.data.data
      appDetailVisible.value = true
    }
  } catch (error) {
    console.error('获取应用详情失败:', error)
  }
}

/**
 * 编辑应用
 */
const editApp = (app: API.AppInfoAdminResVo) => {
  Object.assign(editForm, {
    id: app.id!,
    name: app.name,
    cover: app.cover,
    deployKey: app.deployKey,
    priority: app.priority,
  })
  editAppVisible.value = true
}

/**
 * 更新应用信息
 */
const handleUpdateApp = async () => {
  try {
    await editFormRef.value?.validate()
    updateLoading.value = true

    await update1(editForm)
    message.success('应用信息更新成功')
    editAppVisible.value = false
    await getAppList() // 刷新列表
  } catch (error) {
    console.error('更新应用信息失败:', error)
  } finally {
    updateLoading.value = false
  }
}

/**
 * 获取代码生成类型颜色
 */
const getCodeGenTypeColor = (type?: string) => {
  switch (type) {
    case 'REACT':
      return 'blue'
    case 'VUE':
      return 'green'
    case 'HTML':
      return 'orange'
    default:
      return 'default'
  }
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority?: number) => {
  switch (priority) {
    case 3:
      return 'red'
    case 2:
      return 'orange'
    case 1:
      return 'green'
    default:
      return 'default'
  }
}

// 页面初始化
onMounted(() => {
  getAppList()
  getCodeGenTypes()
})
</script>

<style scoped>
.form-tip {
  margin-top: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.app-cover {
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 40px;
  background: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.user-info {
  font-size: 12px;
}

.user-id {
  color: #666;
  font-size: 11px;
}

.app-detail {
  padding: 16px 0;
}

.app-header-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.app-cover-large {
  margin-right: 16px;
}

.no-cover-large {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 80px;
  background: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}

.app-basic-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.app-id {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.app-tags {
  display: flex;
  gap: 8px;
}

.app-prompt-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.app-prompt-section h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 14px;
  font-weight: 600;
}

.app-prompt {
  margin: 0;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.cover-preview {
  margin-top: 8px;
}
</style>
