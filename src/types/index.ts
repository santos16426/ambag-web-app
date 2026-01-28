export interface User {
  id: string
  phone: string
  email?: string
  firstName: string
  lastName: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  label: 'home' | 'work' | 'favorite' | 'other'
  street: string
  city: string
  state: string
  zipCode: string
  coordinates: {
    latitude: number
    longitude: number
  }
  isDefault: boolean
  instructions?: string
  createdAt: string
}

export interface Restaurant {
  id: string
  name: string
  image: string
  rating: number
  ratingCount: number
  category: string
  deliveryTime: number
  deliveryFee: number
  minOrder: number
  isOpen: boolean
  coordinates: {
    latitude: number
    longitude: number
  }
  address: string
  cuisines: string[]
  createdAt: string
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isAvailable: boolean
  options?: MenuItemOption[]
  createdAt: string
}

export interface MenuItemOption {
  id: string
  name: string
  type: 'single' | 'multiple'
  options: {
    id: string
    name: string
    price: number
  }[]
}

export interface CartItem {
  id: string
  menuItemId: string
  restaurantId: string
  name: string
  price: number
  quantity: number
  image: string
  selectedOptions?: {
    optionId: string
    optionName: string
    selectedValue: string
    selectedPrice: number
  }[]
  specialInstructions?: string
}

export interface Order {
  id: string
  userId: string
  restaurantId: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  serviceFee: number
  tax: number
  tip: number
  promoCode?: string
  promoDiscount: number
  total: number
  status: OrderStatus
  deliveryAddress: Address
  paymentMethod: PaymentMethod
  orderTime: string
  estimatedDeliveryTime: string
  actualDeliveryTime?: string
  riderAssigned?: Rider
  trackingUpdates: TrackingUpdate[]
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'riderAssigned'
  | 'pickedUp'
  | 'onTheWay'
  | 'delivered'
  | 'cancelled'

export interface Rider {
  id: string
  name: string
  phone: string
  avatar: string
  rating: number
  vehicle: string
  licensePlate: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export interface TrackingUpdate {
  status: OrderStatus
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
  message: string
}

export type PaymentMethod = 'cash' | 'card' | 'ewallet' | 'grabpay'

export interface PaymentCard {
  id: string
  userId: string
  cardNumber: string
  cardHolderName: string
  expiryMonth: number
  expiryYear: number
  cvv: string
  isDefault: boolean
  createdAt: string
}

export interface Parcel {
  id: string
  userId: string
  pickupAddress: Address
  dropoffAddress: Address
  parcelType: 'document' | 'food' | 'electronics' | 'clothing' | 'other'
  weight: number
  size: 'small' | 'medium' | 'large'
  vehicleType: 'motorcycle' | 'car' | 'van'
  status: ParcelStatus
  estimatedPrice: number
  finalPrice?: number
  scheduledTime?: string
  pickupTime?: string
  deliveryTime?: string
  riderAssigned?: Rider
  proofOfDelivery?: {
    photo: string
    signature?: string
    timestamp: string
  }
  specialOptions?: {
    codCollection?: number
    insurance: boolean
    fragile: boolean
    notes?: string
  }
  tracking: TrackingUpdate[]
  createdAt: string
}

export type ParcelStatus = 
  | 'pending'
  | 'accepted'
  | 'pickedUp'
  | 'onTheWay'
  | 'delivered'
  | 'cancelled'

export interface Promo {
  id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderValue: number
  maxDiscount?: number
  expiryDate: string
  usageLimit: number
  usageCount: number
  isActive: boolean
  createdAt: string
}

export interface Review {
  id: string
  orderId: string
  userId: string
  restaurantId?: string
  riderId?: string
  rating: number
  text: string
  photos?: string[]
  createdAt: string
}

export interface SupportTicket {
  id: string
  userId: string
  orderId?: string
  subject: string
  description: string
  status: 'open' | 'inProgress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderType: 'user' | 'support'
  message: string
  attachments?: string[]
  createdAt: string
}
