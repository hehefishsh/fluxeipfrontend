<template>
    <div class="max-w-lg mx-auto p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex gap-2">
          <select v-model="selectedYear" @change="updateDate" class="px-2 py-1 border rounded">
            <option v-for="year in yearRange" :key="year" :value="year">{{ year }}</option>
          </select>
          <select v-model="selectedMonth" @change="updateDate" class="px-2 py-1 border rounded">
            <option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</option>
          </select>
        </div>
        <div class="flex gap-4">
        <button @click="prevMonth" class="w-16 h-16 bg-blue-500 text-white rounded-lg shadow-lg text-3xl flex items-center justify-center hover:bg-blue-600">
          ⏪
        </button>
        <button @click="nextMonth" class="w-16 h-16 bg-blue-500 text-white rounded-lg shadow-lg text-3xl flex items-center justify-center hover:bg-blue-600">
          ⏩
        </button>
      </div>
      </div>
      <div class="grid grid-cols-7 gap-2 text-center">
        <div v-for="day in daysOfWeek" :key="day" class="font-bold">{{ day }}</div>
        <div v-for="blank in startDay" :key="'b' + blank" class="invisible"></div>
        <div v-for="date in daysInMonth" :key="date" class="border p-2 cursor-pointer h-16 flex flex-col justify-between items-center">
          <span class="block" @click="addEvent(date)">{{ date }}</span>
          <ul class="text-xs text-blue-500">
            <li v-for="(event, index) in events[date]" :key="index" class="flex justify-between items-center">
              {{ event }}
              <button @click.stop="removeEvent(date, index)" class="ml-2 text-red-500">✖</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      const currentDate = new Date();
      return {
        currentDate,
        selectedYear: currentDate.getFullYear(),
        selectedMonth: currentDate.getMonth(),
        events: {},
        daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        yearRange: Array.from({ length: 21 }, (_, i) => currentDate.getFullYear() - 10 + i),
      };
    },
    computed: {
      startDay() {
        return new Date(this.selectedYear, this.selectedMonth, 1).getDay();
      },
      daysInMonth() {
        return new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
      }
    },
    methods: {
      prevMonth() {
        if (this.selectedMonth === 0) {
          this.selectedMonth = 11;
          this.selectedYear--;
        } else {
          this.selectedMonth--;
        }
      },
      nextMonth() {
        if (this.selectedMonth === 11) {
          this.selectedMonth = 0;
          this.selectedYear++;
        } else {
          this.selectedMonth++;
        }
      },
      updateDate() {
        this.currentDate = new Date(this.selectedYear, this.selectedMonth, 1);
      },
      addEvent(date) {
        const event = prompt("輸入事件:");
        if (event) {
          if (!this.events[date]) {
            this.events[date] = [];
          }
          this.events[date].push(event);
        }
      },
      removeEvent(date, index) {
        this.events[date].splice(index, 1);
        if (this.events[date].length === 0) {
          delete this.events[date];
        }
      }
    }
  };
  </script>
  
  <style>
    .grid-cols-7 { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .h-16 { height: 4rem; }
  </style>
  