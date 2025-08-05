<template>
  <div class="appointment-calendar">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <button
          @click="previousMonth"
          class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ currentMonthName }} {{ currentYear }}
        </h2>
        
        <button
          @click="nextMonth"
          class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          @click="today"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Heute
        </button>
        
        <select
          v-model="selectedView"
          class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="month">Monat</option>
          <option value="week">Woche</option>
          <option value="day">Tag</option>
        </select>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <!-- Weekday Headers -->
      <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        <div
          v-for="day in weekdays"
          :key="day"
          class="p-3 text-sm font-medium text-gray-500 dark:text-gray-400 text-center"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="min-h-[120px] bg-white dark:bg-gray-800 p-2"
          :class="{
            'opacity-50': !day.isCurrentMonth,
            'bg-blue-50 dark:bg-blue-900': day.isToday,
            'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700': day.isCurrentMonth
          }"
          @click="selectDate(day)"
        >
          <div class="flex items-center justify-between mb-1">
            <span
              class="text-sm font-medium"
              :class="{
                'text-gray-400': !day.isCurrentMonth,
                'text-blue-600 dark:text-blue-400': day.isToday,
                'text-gray-900 dark:text-white': day.isCurrentMonth && !day.isToday
              }"
            >
              {{ day.dayNumber }}
            </span>
            
            <button
              v-if="day.isCurrentMonth"
              @click.stop="showQuickAdd(day)"
              class="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>

          <!-- Appointments for this day -->
          <div class="space-y-1">
            <div
              v-for="appointment in day.appointments"
              :key="appointment.id"
              class="text-xs p-1 rounded cursor-pointer"
              :class="getAppointmentClass(appointment.status)"
              @click.stop="showAppointment(appointment)"
            >
              <div class="font-medium truncate">{{ appointment.service.name }}</div>
              <div class="text-xs opacity-75">{{ appointment.start_time }}</div>
            </div>
            
            <div
              v-if="day.appointments.length > 3"
              class="text-xs text-gray-500 dark:text-gray-400 text-center"
            >
              +{{ day.appointments.length - 3 }} weitere
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Add Modal -->
    <div
      v-if="showQuickAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeQuickAdd"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Schneller Termin hinzufügen
        </h3>
        
        <form @submit.prevent="quickAddAppointment">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service
              </label>
              <select
                v-model="quickAddForm.service_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Service auswählen</option>
                <option
                  v-for="service in services"
                  :key="service.id"
                  :value="service.id"
                >
                  {{ service.name }} (€{{ service.price }})
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stylist
              </label>
              <select
                v-model="quickAddForm.stylist_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Stylist auswählen</option>
                <option
                  v-for="stylist in stylists"
                  :key="stylist.id"
                  :value="stylist.id"
                >
                  {{ stylist.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Uhrzeit
              </label>
              <input
                v-model="quickAddForm.time"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notizen
              </label>
              <textarea
                v-model="quickAddForm.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
          </div>
          
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeQuickAdd"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Termin erstellen
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Appointment Detail Modal -->
    <div
      v-if="selectedAppointment"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeAppointmentDetail"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Termin Details
          </h3>
          <button
            @click="closeAppointmentDetail"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Service:</span>
            <p class="text-gray-900 dark:text-white">{{ selectedAppointment.service.name }}</p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Datum & Zeit:</span>
            <p class="text-gray-900 dark:text-white">
              {{ formatDateTime(selectedAppointment.start_time) }} - {{ formatTime(selectedAppointment.end_time) }}
            </p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Stylist:</span>
            <p class="text-gray-900 dark:text-white">{{ selectedAppointment.stylist.name }}</p>
          </div>
          
          <div v-if="selectedAppointment.customer">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Kunde:</span>
            <p class="text-gray-900 dark:text-white">{{ selectedAppointment.customer.name }}</p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
            <span
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              :class="getStatusClass(selectedAppointment.status)"
            >
              {{ selectedAppointment.status }}
            </span>
          </div>
          
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Preis:</span>
            <p class="text-gray-900 dark:text-white">€{{ selectedAppointment.price }}</p>
          </div>
          
          <div v-if="selectedAppointment.notes">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Notizen:</span>
            <p class="text-gray-900 dark:text-white">{{ selectedAppointment.notes }}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-end space-x-3 mt-6">
          <button
            @click="closeAppointmentDetail"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Schließen
          </button>
          <a
            :href="`/appointments/${selectedAppointment.id}`"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Details anzeigen
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

export default {
  name: 'AppointmentCalendar',
  props: {
    appointments: {
      type: Array,
      default: () => []
    },
    services: {
      type: Array,
      default: () => []
    },
    stylists: {
      type: Array,
      default: () => []
    }
  },
  emits: ['appointment-created', 'date-selected'],
  setup(props, { emit }) {
    const currentDate = ref(new Date())
    const selectedView = ref('month')
    const showQuickAddModal = ref(false)
    const selectedAppointment = ref(null)
    const selectedDate = ref(null)
    
    const quickAddForm = ref({
      service_id: '',
      stylist_id: '',
      time: '',
      notes: ''
    })

    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

    const currentMonthName = computed(() => {
      return format(currentDate.value, 'MMMM', { locale: de })
    })

    const currentYear = computed(() => {
      return format(currentDate.value, 'yyyy')
    })

    const calendarDays = computed(() => {
      const start = startOfMonth(currentDate.value)
      const end = endOfMonth(currentDate.value)
      const days = eachDayOfInterval({ start, end })
      
      return days.map(day => {
        const dayAppointments = props.appointments.filter(appointment => 
          isSameDay(parseISO(appointment.start_time), day)
        )
        
        return {
          date: day,
          dayNumber: format(day, 'd'),
          isCurrentMonth: isSameMonth(day, currentDate.value),
          isToday: isToday(day),
          appointments: dayAppointments
        }
      })
    })

    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
    }

    const today = () => {
      currentDate.value = new Date()
    }

    const selectDate = (day) => {
      if (day.isCurrentMonth) {
        emit('date-selected', day.date)
      }
    }

    const showQuickAdd = (day) => {
      selectedDate.value = day.date
      showQuickAddModal.value = true
    }

    const closeQuickAdd = () => {
      showQuickAddModal.value = false
      quickAddForm.value = {
        service_id: '',
        stylist_id: '',
        time: '',
        notes: ''
      }
    }

    const quickAddAppointment = async () => {
      try {
        const appointmentData = {
          ...quickAddForm.value,
          start_time: `${format(selectedDate.value, 'yyyy-MM-dd')}T${quickAddForm.value.time}:00`
        }
        
        emit('appointment-created', appointmentData)
        closeQuickAdd()
      } catch (error) {
        console.error('Error creating appointment:', error)
      }
    }

    const showAppointment = (appointment) => {
      selectedAppointment.value = appointment
    }

    const closeAppointmentDetail = () => {
      selectedAppointment.value = null
    }

    const getAppointmentClass = (status) => {
      const classes = {
        confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      }
      return classes[status] || classes.pending
    }

    const getStatusClass = (status) => {
      const classes = {
        confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      }
      return classes[status] || classes.pending
    }

    const formatDateTime = (dateTime) => {
      return format(parseISO(dateTime), 'dd.MM.yyyy HH:mm')
    }

    const formatTime = (dateTime) => {
      return format(parseISO(dateTime), 'HH:mm')
    }

    return {
      currentDate,
      selectedView,
      showQuickAddModal,
      selectedAppointment,
      quickAddForm,
      weekdays,
      currentMonthName,
      currentYear,
      calendarDays,
      previousMonth,
      nextMonth,
      today,
      selectDate,
      showQuickAdd,
      closeQuickAdd,
      quickAddAppointment,
      showAppointment,
      closeAppointmentDetail,
      getAppointmentClass,
      getStatusClass,
      formatDateTime,
      formatTime
    }
  }
}
</script>

<style scoped>
.appointment-calendar {
  @apply w-full;
}
</style> 