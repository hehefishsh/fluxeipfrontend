<template>
  <div class="wrapper">
    <!-- ====================================
  ——— LEFT SIDEBAR WITH OUT FOOTER
===================================== -->
    <aside class="left-sidebar sidebar-dark" id="left-sidebar">
      <div id="sidebar" class="sidebar sidebar-with-footer">
        <div class="app-brand">
          <RouterLink class="sidenav-item-link" to="/">
            <img :src="logo" alt="FluxEIP" width:20px />
            <span
              class="brand-name"
              style="margin-left: 20px; font-size: x-large"
              >FluxEIP</span
            >
          </RouterLink>
        </div>
        <!-- begin sidebar scrollbar -->
        <div class="sidebar-left" data-simplebar style="height: 100%">
          <!-- sidebar menu -->
          <ul class="nav sidebar-inner" id="sidebar-menu">
            <!-- 單目錄的導引欄--個人資訊 -->
            <li :class="{ active: route.path === '/employee/detail' }">
              <RouterLink class="sidenav-item-link" to="/employee/detail"
                ><i class="mdi mdi-account"></i>
                <span class="nav-text">個人資訊</span>
              </RouterLink>
            </li>
            <!-- 單目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--員工管理 -->
            <li class="has-sub expand" :class="{
              active: /^\/employee\/manage(\/.*)?$/.test(route.path),}" 
              v-if="user.roleName === '最高管理員' || user.roleName === '人資主管'">
              <a class="sidenav-item-link" href="javascript:void(0)" data-toggle="collapse" data-target="#employee" aria-expanded="false" aria-controls="employee">
                <i class="mdi mdi-account-box-multiple"></i>
                <span class="nav-text">員工管理</span> <b class="caret"></b>
              </a>
              <ul class="collapse" id="employee" data-parent="#sidebar-menu">
                <div class="sub-menu">
                  <li
                    :class="{
                      active: route.path === '/employee/manage/search',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/employee/manage/search"
                    >
                      <span class="nav-text">員工查詢</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{
                      active: route.path === '/employee/manage/create',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/employee/manage/create"
                    >
                      <span class="nav-text">新增員工</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--工作事項 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/work(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#work"
                aria-expanded="false"
                aria-controls="work"
              >
                <i class="mdi mdi-briefcase"></i>
                <span class="nav-text">工作事項</span> <b class="caret"></b>
              </a>
              <ul class="collapse" id="work" data-parent="#sidebar-menu">
                <div class="sub-menu">
                  <li v-if="user.roleName != '員工'">
                    <RouterLink class="sidenav-item-link" to="/work/progress">
                      <span class="nav-text">工作事項</span>
                    </RouterLink>
                  </li>
                  <li v-if="user.roleName != '員工'">
                    <RouterLink class="sidenav-item-link" to="/work/progress/create">
                      <span class="nav-text">新增工作</span>
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink
                      class="sidenav-item-link"
                      to="/work/taskprogress"
                    >
                      <span class="nav-text">交辦事項</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--出勤與打卡 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/attendance(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#attendance"
                aria-expanded="false"
                aria-controls="attendance"
              >
                <i class="mdi mdi-clock-outline"></i>
                <span class="nav-text">出勤與打卡</span> <b class="caret"></b>
              </a>
              <ul class="collapse" id="attendance" data-parent="#sidebar-menu">
                <div class="sub-menu">
                  <li :class="{ active: route.path === '/attendance/clock' }">
                    <RouterLink
                      class="sidenav-item-link"
                      to="/attendance/clock"
                    >
                      <span class="nav-text">打卡</span>
                    </RouterLink>
                  </li>
                  <li :class="{ active: route.path === '/attendance/log' }">
                    <RouterLink class="sidenav-item-link" to="/attendance/log">
                      <span class="nav-text">出勤記錄查詢</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--申請表單 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/requestform(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#requestform"
                aria-expanded="false"
                aria-controls="requestform"
              >
                <i class="mdi mdi-file-document-outline"></i>
                <span class="nav-text">申請表單</span> <b class="caret"></b>
              </a>
              <ul class="collapse" id="requestform" data-parent="#sidebar-menu">
                <div class="sub-menu">
                  <li :class="{ active: route.path === '/requestform/leave' }">
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestform/leave"
                    >
                      <span class="nav-text">請假申請</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{
                      active: route.path === '/requestform/workadjust',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestform/workadjust"
                    >
                      <span class="nav-text">加班申請</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{
                      active: route.path === '/requestform/missingpunch',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestform/missingpunch"
                    >
                      <span class="nav-text">補卡申請</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{ active: route.path === '/requestform/expense' }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestform/expense"
                    >
                      <span class="nav-text">費用申請</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--申請表單查詢 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/requestmanage(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#requestmanage"
                aria-expanded="false"
                aria-controls="requestmanage"
              >
                <i class="mdi mdi-file-find-outline"></i>
                <span class="nav-text">表單查詢</span> <b class="caret"></b>
              </a>
              <ul
                class="collapse"
                id="requestmanage"
                data-parent="#sidebar-menu"
              >
                <div class="sub-menu">
                  <li
                    :class="{ active: route.path === '/requestmanage/leave' }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestmanage/leave"
                    >
                      <span class="nav-text">請假查詢</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{
                      active: route.path === '/requestmanage/workadjust',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestmanage/workadjust"
                    >
                      <span class="nav-text">加減班查詢</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{
                      active: route.path === '/requestmanage/missingpunch',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestmanage/missingpunch"
                    >
                      <span class="nav-text">補卡查詢</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{ active: route.path === '/requestmanage/expense' }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestmanage/expense"
                    >
                      <span class="nav-text">費用查詢</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--簽核查詢 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/requestapproval(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#requestapproval"
                aria-expanded="false"
                aria-controls="requestapproval"
              >
                <i class="mdi mdi-swap-horizontal-variant"></i>
                <span class="nav-text">簽核</span> <b class="caret"></b>
              </a>
              <ul
                class="collapse"
                id="requestapproval"
                data-parent="#sidebar-menu"
              >
                <div class="sub-menu">
                  <li
                    :class="{ active: route.path === '/requestapproval/leave' }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestapproval/leave"
                    >
                      <span class="nav-text">請假簽核</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{
                      active: route.path === '/requestapproval/workadjust',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestapproval/workadjust"
                    >
                      <span class="nav-text">加減班簽核</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{
                      active: route.path === '/requestapproval/missingpunch',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestapproval/missingpunch"
                    >
                      <span class="nav-text">補卡簽核</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{
                      active: route.path === '/requestapproval/expense',
                    }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/requestapproval/expense"
                    >
                      <span class="nav-text">費用簽核</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--簽核管理 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/approvalflow(\/.*)?$/.test(route.path) }"
              v-if="
                ['最高管理員', '次等管理員', '人資主管'].includes(user.roleName)
              "
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#approvalflow"
                aria-expanded="false"
                aria-controls="approvalflow"
              >
                <i class="mdi mdi-swap-horizontal-variant"></i>
                <span class="nav-text">簽核流程管理</span> <b class="caret"></b>
              </a>
              <ul
                class="collapse"
                id="approvalflow"
                data-parent="#sidebar-menu"
              >
                <div class="sub-menu">
                  <li
                    :class="{ active: route.path === '/approvalflow/create' }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/approvalflow/create"
                    >
                      <span class="nav-text">自訂簽核流程</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{ active: route.path === '/approvalflow/manage' }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/approvalflow/manage"
                    >
                      <span class="nav-text">管理簽核流程</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{ active: route.path === '/approvalflow/assign' }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/approvalflow/assign"
                    >
                      <span class="nav-text">指派簽核流程</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 單目錄的導引欄--外勤 -->
            <li :class="{ active: route.path === '/fieldwork/manage' }">
              <RouterLink class="sidenav-item-link" to="/fieldwork/manage"
                ><i class="mdi mdi-door-open"></i>
                <span class="nav-text">外勤管理</span>
              </RouterLink>
            </li>
            <!-- 單目錄的導引欄結束 -->

            <!-- 單目錄的導引欄--公佈欄 -->
            <li :class="{ active: route.path === '/bulletin' }">
              <RouterLink class="sidenav-item-link" to="/bulletin"
                ><i class="mdi mdi-bulletin-board"></i>
                <span class="nav-text">公佈欄</span>
              </RouterLink>
            </li>
            <!-- 單目錄的導引欄結束 -->

            <!-- 有子目錄的導引欄--行事曆 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/calendar(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#calendar"
                aria-expanded="false"
                aria-controls="calendar"
              >
                <i class=""></i>
                <span class="nav-text">行事曆</span> <b class="caret"></b>
              </a>
              <ul class="collapse" id="calendar" data-parent="#sidebar-menu">
                <div class="sub-menu">
                  <li
                    :class="{ active: route.path === '/calendar/department' }"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/calendar/department"
                    >
                      <span class="nav-text">部門行事曆</span>
                    </RouterLink>
                  </li>
                  <li :class="{ active: route.path === '/calendar/personal' }">
                    <RouterLink
                      class="sidenav-item-link"
                      to="/calendar/personal"
                    >
                      <span class="nav-text">個人行事曆</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有子目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--會議管理 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/meeting(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#meeting"
                aria-expanded="false"
                aria-controls="meeting"
              >
                <i class="mdi mdi-theater"></i>
                <span class="nav-text">會議</span> <b class="caret"></b>
              </a>
              <ul class="collapse" id="meeting" data-parent="#sidebar-menu">
                <div class="sub-menu">
                  <li :class="{ active: route.path === '/meeting/manage' }">
                    <RouterLink class="sidenav-item-link" to="/meeting/manage">
                      <span class="nav-text">會議室資訊</span>
                    </RouterLink>
                  </li>
                  <li
                    class="has-sub expand"
                    :class="{ active: /^\/meeting(\/.*)?$/.test(route.path) }"
                    v-if="
                      [
                        '最高管理員',
                        '次等管理員',
                        '行政主管',
                        '人資主管',
                        '業務主管',
                        '技術主管',
                        '員工',
                      ].includes(user.roleName)
                    "
                  >
                    <RouterLink class="sidenav-item-link" to="/meeting/create">
                      <span class="nav-text">預約列表</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 單目錄的導引欄--智庫 -->
            <li :class="{ active: route.path === '/guideline/all' }">
              <RouterLink class="sidenav-item-link" to="/guideline/all"
                ><i class="mdi mdi-folder-outline"></i>
                <span class="nav-text">智庫</span>
              </RouterLink>
            </li>
            <!-- 單目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--排班 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/schedule(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#schedule"
                aria-expanded="false"
                aria-controls="schedule"
              >
                <i class="mdi mdi-calendar"></i>
                <span class="nav-text">排班</span> <b class="caret"></b>
              </a>
              <ul class="collapse" id="schedule" data-parent="#sidebar-menu">
                <div class="sub-menu">
                  <li
                    :class="{ active: route.path === '/schedule/shiftType' }"
                    v-if="[...scheduleRoles].includes(user.roleName)"
                  >
                    <RouterLink
                      class="sidenav-item-link"
                      to="/schedule/shiftType"
                    >
                      <span class="nav-text">班別</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{ active: route.path === '/schedule/create' }"
                    v-if="[...scheduleRoles].includes(user.roleName)"
                  >
                    <RouterLink class="sidenav-item-link" to="/schedule/create">
                      <span class="nav-text">排班功能</span>
                    </RouterLink>
                  </li>
                  <li :class="{ active: route.path === '/schedule/detail' }">
                    <RouterLink class="sidenav-item-link" to="/schedule/detail">
                      <span class="nav-text">排班查詢</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->

            <!-- 有的子目錄的導引欄--排班 -->
            <li
              class="has-sub expand"
              :class="{ active: /^\/salary(\/.*)?$/.test(route.path) }"
            >
              <a
                class="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#salary"
                aria-expanded="false"
                aria-controls="salary"
              >
                <i class="mdi mdi-currency-usd"></i>
                <span class="nav-text">薪資相關</span> <b class="caret"></b>
              </a>
              <ul class="collapse" id="salary" data-parent="#sidebar-menu">
                <div class="sub-menu">
                  <li
                    :class="{ active: route.path === '/salary/all' }"
                    v-if="
                      ['最高管理員', '次等管理員', '人資主管'].includes(
                        user.roleName
                      )
                    "
                  >
                    <RouterLink class="sidenav-item-link" to="/salary/all">
                      <span class="nav-text">薪資設定</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{ active: route.path === '/salary/monthly' }"
                    v-if="
                      ['最高管理員', '次等管理員', '人資主管'].includes(
                        user.roleName
                      )
                    "
                  >
                    <RouterLink class="sidenav-item-link" to="/salary/monthly">
                      <span class="nav-text">員工薪資結算</span>
                    </RouterLink>
                  </li>
                  <li
                    :class="{ active: route.path === '/salary/manage' }"
                    v-if="
                      ['最高管理員', '次等管理員', '人資主管'].includes(
                        user.roleName
                      )
                    "
                  >
                    <RouterLink class="sidenav-item-link" to="/salary/manage">
                      <span class="nav-text">全體薪資明細</span>
                    </RouterLink>
                  </li>
                  <li :class="{ active: route.path === '/salary/bonus' }" v-if="
                    ['最高管理員', '次等管理員', '人資主管'].includes(
                      user.roleName
                    )
                  ">
                    <RouterLink class="sidenav-item-link" to="/salary/bonus">
                      <span class="nav-text">獎金/津貼設定</span>
                    </RouterLink>
                  </li>
                  <li :class="{ active: route.path === '/salary/detail' }">
                    <RouterLink class="sidenav-item-link" to="/salary/detail">
                      <span class="nav-text">薪資明細</span>
                    </RouterLink>
                  </li>
                </div>
              </ul>
            </li>
            <!-- 有的子目錄的導引欄結束 -->
          </ul>
        </div>
      </div>
    </aside>

    <!-- ====================================
——— PAGE WRAPPER
===================================== -->

    <div class="page-wrapper">
      <!-- Header -->
      <header class="main-header" id="header">
        <nav class="navbar navbar-expand-lg navbar-light" id="navbar">
          <!-- Sidebar toggle button -->
          <button id="sidebar-toggler" class="sidebar-toggle">
            <span class="sr-only">Toggle navigation</span>
          </button>

          <span class="page-title"
            >{{ pageTitle }}
            <!-- 這裡接收 App.vue 的標題 --></span
          >

          <div class="navbar-right">
            <ul class="nav navbar-nav">
              <!-- Offcanvas -->
              <li class="custom-dropdown">
                <a
                  class="offcanvas-toggler active custom-dropdown-toggler"
                  data-offcanvas="contact-off"
                  href="/contacts"
                >
                  <i class="mdi mdi-contacts icon"></i>
                </a>
              </li>
              <li class="custom-dropdown">
                <Bell />
              </li>
              <li class="dropdown user-menu">
                <button class="dropdown-toggle nav-link" data-toggle="dropdown">
                  <img
                    :src="user.empPhoto"
                    class="user-image rounded-circle"
                    alt="User Image"
                  />
                  <span class="d-none d-lg-inline-block">{{
                    user.empName
                  }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-right">
                  <li>
                    <RouterLink class="dropdown-link-item" to="/employee/detail"
                      ><i class="mdi mdi-account-outline"></i>
                      <span class="nav-text">個人資訊</span>
                    </RouterLink>
                  </li>
                  <li>
                    <a class="dropdown-link-item" href="email-inbox.html">
                      <i class="mdi mdi-email-outline"></i>
                      <span class="nav-text">Message</span>
                      <span class="badge badge-pill badge-primary">24</span>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-link-item" href="user-activities.html">
                      <i class="mdi mdi-diamond-stone"></i>
                      <span class="nav-text">Activitise</span></a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-link-item"
                      href="user-account-settings.html"
                    >
                      <i class="mdi mdi-settings"></i>
                      <span class="nav-text">Account Setting</span>
                    </a>
                  </li>

                  <li class="dropdown-footer">
                    <a class="dropdown-link-item">
                      <button @click="logOut">
                        <i class="mdi mdi-logout"></i> Log Out
                      </button>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <!-- ====================================
    ——— CONTENT WRAPPER
    ===================================== -->
      <div class="content-wrapper">
        <div class="content">
          <slot></slot>
        </div>

        <!-- Footer -->
        <footer class="footer mt-auto">
          <div class="copyright bg-white">
            <p>
              &copy; <span id="copy-year"></span> Copyright Mono Dashboard
              Bootstrap Template by
              <a
                class="text-primary"
                href="http://www.iamabdus.com/"
                target="_blank"
                >Abdus</a
              >.
            </p>
          </div>
        </footer>
      </div>
    </div>
  </div>
  <!-- Card Offcanvas -->
  <div class="card card-offcanvas" id="contact-off">
    <div class="card-header">
      <h2>Contacts</h2>
      <a href="#" class="btn btn-primary btn-pill px-4">Add New</a>
    </div>
    <div class="card-body">
      <div class="mb-4">
        <input
          type="text"
          class="form-control form-control-lg form-control-secondary rounded-0"
          placeholder="Search contacts..."
        />
      </div>

      <div class="media media-sm">
        <div class="media-sm-wrapper">
          <a href="user-profile.html">
            <img src="" alt="User Image" />
            <span class="active bg-primary"></span>
          </a>
        </div>
        <div class="media-body">
          <a href="user-profile.html">
            <span class="title">Selena Wagner</span>
            <span class="discribe">Designer</span>
          </a>
        </div>
      </div>

      <div class="media media-sm">
        <div class="media-sm-wrapper">
          <a href="user-profile.html">
            <img src="" alt="User Image" />
            <span class="active bg-primary"></span>
          </a>
        </div>
        <div class="media-body">
          <a href="user-profile.html">
            <span class="title">Walter Reuter</span>
            <span>Developer</span>
          </a>
        </div>
      </div>

      <div class="media media-sm">
        <div class="media-sm-wrapper">
          <a href="user-profile.html">
            <img src="" alt="User Image" />
          </a>
        </div>
        <div class="media-body">
          <a href="user-profile.html">
            <span class="title">Larissa Gebhardt</span>
            <span>Cyber Punk</span>
          </a>
        </div>
      </div>

      <div class="media media-sm">
        <div class="media-sm-wrapper">
          <a href="user-profile.html">
            <img src="" alt="User Image" />
          </a>
        </div>
        <div class="media-body">
          <a href="user-profile.html">
            <span class="title">Albrecht Straub</span>
            <span>Photographer</span>
          </a>
        </div>
      </div>

      <div class="media media-sm">
        <div class="media-sm-wrapper">
          <a href="user-profile.html">
            <img src="" alt="User Image" />
            <span class="active bg-danger"></span>
          </a>
        </div>
        <div class="media-body">
          <a href="user-profile.html">
            <span class="title">Leopold Ebert</span>
            <span>Fashion Designer</span>
          </a>
        </div>
      </div>

      <div class="media media-sm">
        <div class="media-sm-wrapper">
          <a href="user-profile.html">
            <img src="" alt="User Image" />
            <span class="active bg-primary"></span>
          </a>
        </div>
        <div class="media-body">
          <a href="user-profile.html">
            <span class="title">Selena Wagner</span>
            <span>Photographer</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute } from "vue-router";
import logo from "@/images/dashboard.png";
import { computed } from "vue";
const route = useRoute(); // 取得當前路由資訊
const pageTitle = computed(() => route.meta.title || "未命名頁面");
import useUserStore from "@/stores/user";
const user = useUserStore();
import { useRouter } from "vue-router";
const router = useRouter();
import axiosapi from "@/plugins/axios-login";
import Bell from "@/views/bell/Bell.vue";

function logOut() {
  axiosapi.defaults.headers.common["Authorization"] = ``;
  user.clear();
  router.push("/login");
}

const scheduleRoles = [
  "最高管理員",
  "次等管理員",
  "行政主管",
  "人資主管",
  "業務主管",
  "技術主管",
]; // 可以排班的角色
</script>

<style></style>
