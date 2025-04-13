import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { StyledButton } from '@/components/button/button-lellall';
import SearchBar from '@/components/search-bar/search-bar';
import { Add, Trash, Edit } from 'iconsax-react';
import { useGetReservationQuery, useCreateReservationMutation } from '@/redux/api/reservations/reservations.api';
import { useGetAllMenuItemsQuery } from '@/redux/api/menu/menu.api';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';

const localizer = momentLocalizer(moment);

const CalendarWrapper = styled.div`
  position: relative;
  .rbc-calendar {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    font-size: 11px !important;
    font-weight: 300 !important;
    border: 1px solid #e5e7eb;
  }
  .rbc-event {
    border-radius: 4px !important;
    padding: 5px 8px !important;
    font-weight: 400 !important;
    box-shadow: none !important;
  }
  .rbc-btn-group {
    font-size: 11px !important;
    font-weight: 300 !important;
    button {
      border: 1px solid #e5e7eb !important;
      background: #fff !important;
      color: #4a5568 !important;
    }
  }
  .rbc-off-range-bg {
    background: #f9fafb !important;
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: opacity 0.3s;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  pointer-events: ${props => (props.isOpen ? 'auto' : 'none')};
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 80%;
  max-width: 700px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const Sidebar = styled.div`
  width: 220px;
  background: #f9fafb;
  padding: 1.5rem 1rem;
  border-right: 1px solid #e5e7eb;
`;

const Content = styled.div`
  flex: 1;
  padding: 1.5rem;
  background: #ffffff;
`;

const StepItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  .circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => (props.active ? '#05431E' : '#e0e0e0')};
    color: white;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
  .title {
    font-size: 13px;
    font-weight: 400;
    color: ${props => (props.active ? '#05431E' : '#5f6368')};
    transition: color 0.3s;
  }
  .desc {
    font-size: 10px;
    font-weight: 300;
    color: #9aa0a6;
    margin-top: 2px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(85vh - 180px);
  overflow-y: auto;
  padding-right: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 400;
  color: #3c4043;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  padding: 0.625rem 0.75rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 300;
  background: #f1f3f4;
  color: #202124;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: #05431E;
    box-shadow: 0 0 0 2px rgba(5, 67, 30, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.625rem 0.75rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 300;
  background: #f1f3f4;
  color: #202124;
  appearance: none;
  background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%235f6368"%3E%3Cpath d="M7 10l5 5 5-5z"/%3E%3C/svg%3E');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 14px;
  &:focus {
    outline: none;
    border-color: #05431E;
    box-shadow: 0 0 0 2px rgba(5, 67, 30, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.625rem 0.75rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 300;
  background: #f1f3f4;
  color: #202124;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: #05431E;
    box-shadow: 0 0 0 2px rgba(5, 67, 30, 0.2);
  }
`;

const MenuPicker = styled.div`
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 0.75rem;
`;

const MenuSearch = styled.input`
  width: 100%;
  padding: 0.625rem;
  border: none;
  border-bottom: 1px solid #dadce0;
  font-size: 12px;
  font-weight: 300;
  background: transparent;
  outline: none;
  &:focus {
    border-bottom-color: #05431E;
  }
`;

const MenuList = styled.div`
  max-height: 160px;
  overflow-y: auto;
  margin-top: 0.75rem;
`;

const MenuItemOption = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 300;
  background: ${props => (props.selected ? '#e6f4ea' : 'transparent')};
  &:hover {
    background: #f1f3f4;
  }
`;

const MenuItemPreview = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #dadce0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
`;

const ReviewItem = styled.div`
  background: #f9fafb;
  padding: 0.625rem;
  border-radius: 4px;
  margin-bottom: 0.625rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 300;
`;

const EventDetailsContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EventDetailsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const EventDetailsTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #202124;
`;

const EventDetailsClose = styled.button`
  padding: 0.5rem;
  background: none;
  border: none;
  font-size: 16px;
  color: #5f6368;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #202124;
  }
`;

const EventDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.75rem;
  font-size: 12px;
  font-weight: 300;
  color: #202124;
`;

const EventDetailsLabel = styled.span`
  font-weight: 400;
  color: #3c4043;
`;

interface ReservationEvent {
    id?: string;
    title: string;
    start?: Date;
    end?: Date;
    type?: string;
    location?: string;
    attendees: number;
    notes?: string;
    reminder?: string;
    customerEmail?: string;
    customerPhone?: string;
    deposit?: number;
    paymentType?: 'CASH' | 'TRANSFER';
    orderItems?: { menuItemId: string; quantity: number; name?: string; price?: number }[];
    date?: string;
    time?: string;
    status?: string;
}

const eventStyleGetter = (event: ReservationEvent) => {
    let backgroundColor = '#fefcbf';
    let borderColor = '#F59E0B';
    let textColor = '#713f12';

    switch (event.status?.toLowerCase()) {
        case 'confirmed':
            backgroundColor = '#d1e7dd';
            borderColor = '#0f5132';
            textColor = '#0f5132';
            break;
        case 'cancelled':
            backgroundColor = '#f8d7da';
            borderColor = '#842029';
            textColor = '#842029';
            break;
        case 'pending':
        default:
            backgroundColor = '#fefcbf';
            borderColor = '#F59E0B';
            textColor = '#713f12';
            break;
    }

    return {
        style: {
            backgroundColor,
            borderRadius: '4px',
            padding: '5px 8px',
            fontWeight: '400',
            borderLeft: `2px solid ${borderColor}`,
            color: textColor,
            boxShadow: 'none !important',
        },
    };
};
interface ReservationEvent {
    id?: string;
    title: string;
    start?: Date;
    end?: Date;
    type?: string;
    location?: string;
    attendees: number;
    notes?: string;
    reminder?: string;
    customerEmail?: string;
    customerPhone?: string;
    deposit?: number;
    paymentType?: 'CASH' | 'TRANSFER';
    orderItems?: { menuItemId: string; quantity: number; name?: string; price?: number }[];
    date?: string;
    time?: string;
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';
}

export default function StyledCalendar() {
    const { subdomain } = useSelector(selectAuth);

    const { data: reservations, isLoading: isLoadingReservations, refetch } = useGetReservationQuery(subdomain);
    const [createReservation] = useCreateReservationMutation();
    // const [updateReservation] = useUpdateReservationMutation();
    // const [deleteReservation] = useDeleteReservationMutation();
    const { data: menuItems = [], isLoading: isLoadingMenu } = useGetAllMenuItemsQuery({ subdomain });

    const [selectedEvent, setSelectedEvent] = useState<ReservationEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [step, setStep] = useState(1);
    const [menuSearch, setMenuSearch] = useState('');

    const events: ReservationEvent[] = reservations?.map((reservation: any) => {
        const startDate = new Date(`${reservation.date.split('T')[0]}T${reservation.time}:00`);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);
        return {
            id: reservation.id,
            title: reservation.customerName,
            start: startDate,
            end: endDate,
            type: reservation.status,
            location: reservation.location || "John's Restaurant",
            attendees: reservation.partySize || 1,
            notes: reservation.specialRequests || "",
            reminder: reservation.reminder || "30 minutes before",
            customerEmail: reservation.customerEmail || "",
            customerPhone: reservation.customerPhone || "",
            deposit: reservation.deposit || 0,
            paymentType: reservation.paymentType || "CASH",
            orderItems: reservation.order?.orderItems?.map((item: any) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                name: menuItems.find((m: any) => m.id === item.menuItemId)?.name,
                price: menuItems.find((m: any) => m.id === item.menuItemId)?.price
            })) || [],
            status: reservation.status || 'PENDING', // Ensure status matches enum values
        };
    }) || [];

    const [formData, setFormData] = useState<ReservationEvent>({
        title: '',
        customerEmail: '',
        customerPhone: '',
        attendees: 1,
        date: '',
        time: '',
        status: 'PENDING',
        notes: '',
        deposit: 0,
        paymentType: 'CASH',
        location: "John's Restaurant",
        reminder: '30 minutes before',
        orderItems: [],
    });

    useEffect(() => {
        if (selectedEvent && isEditMode) {
            setFormData({
                ...selectedEvent,
                date: moment(selectedEvent.start).format('YYYY-MM-DD'),
                time: moment(selectedEvent.start).format('HH:mm'),
            });
        }
    }, [selectedEvent, isEditMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'attendees' || name === 'deposit' ? parseInt(value) || 0 : value,
        }));
    };

    const handleMenuItemToggle = (menuItem: any) => {
        setFormData(prev => {
            const exists = prev.orderItems?.some(item => item.menuItemId === menuItem.id);
            if (exists) {
                return {
                    ...prev,
                    orderItems: prev.orderItems?.filter(item => item.menuItemId !== menuItem.id) || []
                };
            }
            return {
                ...prev,
                orderItems: [...(prev.orderItems || []), {
                    menuItemId: menuItem.id,
                    quantity: 1,
                    name: menuItem.name,
                    price: menuItem.price
                }]
            };
        });
        setMenuSearch('');
    };

    const handleQuantityChange = (menuItemId: string, quantity: number) => {
        setFormData(prev => ({
            ...prev,
            orderItems: prev.orderItems?.map(item =>
                item.menuItemId === menuItemId
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            ) || []
        }));
    };

    const handleDelete = async () => {
        if (selectedEvent?.id) {
            if (window.confirm('Are you sure you want to delete this reservation?')) {
                // await deleteReservation({ subdomain, id: selectedEvent.id }).unwrap();
                setSelectedEvent(null);
                refetch();
            }
        }
    };

    const handleEdit = () => {
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const validateStep = () => {
        switch (step) {
            case 1:
                return formData.title && formData.date && formData.time && formData.attendees > 0;
            case 2:
                return formData.customerEmail && formData.customerPhone;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!validateStep()) {
            alert('Please fill in all required fields for this step');
            return;
        }
        setStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step !== 3) {
            nextStep(e as any);
            return;
        }

        try {
            const submissionData = {
                customerName: formData.title,
                partySize: formData.attendees,
                date: formData.date,
                time: formData.time,
                status: formData.status,
                specialRequests: formData.notes,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                deposit: formData.deposit,
                paymentType: formData.paymentType,
                location: formData.location,
                reminder: formData.reminder,
                orderItems: formData.orderItems?.map(item => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity
                }))
            };

            if (isEditMode && selectedEvent?.id) {
                if (submissionData.orderItems && submissionData.orderItems.length === 0) {
                    delete submissionData.orderItems;
                }
                // await updateReservation({ subdomain, id: selectedEvent.id, data: submissionData }).unwrap();
            } else {
                await createReservation({ subdomain, data: submissionData }).unwrap();
            }

            setIsModalOpen(false);
            setIsEditMode(false);
            setStep(1);
            setFormData({
                title: '',
                customerEmail: '',
                customerPhone: '',
                attendees: 1,
                date: '',
                time: '',
                status: 'PENDING',
                notes: '',
                deposit: 0,
                paymentType: 'CASH',
                location: `${subdomain} Restaurant`,
                reminder: '30 minutes before',
                orderItems: [],
            });
            setSelectedEvent(null);
            refetch();
        } catch (error) {
            console.error('Failed to save reservation:', error);
        }
    };

    if (isLoadingReservations || isLoadingMenu) return <div>Loading...</div>;

    const filteredMenuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(menuSearch.toLowerCase())
    );
    console.log(selectedEvent, 'selectedEvent');

    return (
        <div>
            <div className="flex mb-6 justify-between items-center">
                <SearchBar
                    placeholder="Search reservations"
                    width="320px"
                    height="44px"
                    border="1px solid #e5e7eb"
                    borderRadius="10px"
                    backgroundColor="#f9fafb"
                    shadow={false}
                    fontSize="14px"
                    color="#374151"
                    inputPadding="12px"
                    placeholderColor="#6b7280"
                    iconColor="#9ca3af"
                    iconSize={18}
                />
                <StyledButton
                    style={{ padding: '12px 24px', fontWeight: 600 }}
                    background="#05431E"
                    color="white"
                    width="180px"
                    variant="solid"
                    border="none"
                    onClick={() => {
                        setIsEditMode(false);
                        setIsModalOpen(true);
                    }}
                >
                    <Add size="20" color="white" /> New Reservation
                </StyledButton>
            </div>
            <CalendarWrapper>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={['month', 'week', 'day']}
                    defaultView="month"
                    style={{ height: 650 }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={(event) => setSelectedEvent(event)}
                />

                {selectedEvent && (
                    <Modal isOpen={true}>
                        <ModalContent>
                            <div className="flex h-full">
                                <Sidebar>
                                    <h2 className="text-14px font-medium text-gray-800 mb-6">Event Details</h2>
                                </Sidebar>
                                <EventDetailsContent>
                                    <EventDetailsHeader>
                                        <EventDetailsTitle>{selectedEvent.title}</EventDetailsTitle>
                                        <div>
                                            <button
                                                onClick={handleEdit}
                                                className="mr-2 p-2 text-gray-600 hover:text-gray-800"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="p-2 text-red-600 hover:text-red-800"
                                            >
                                                <Trash size={16} />
                                            </button>
                                            <EventDetailsClose onClick={() => setSelectedEvent(null)}>✕</EventDetailsClose>
                                        </div>
                                    </EventDetailsHeader>
                                    <EventDetailsGrid>
                                        <EventDetailsLabel>Date & Time:</EventDetailsLabel>
                                        <span>{moment(selectedEvent.start).format('LL')} at {selectedEvent.start!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <EventDetailsLabel>Attendees:</EventDetailsLabel>
                                        <span>{selectedEvent.attendees}</span>
                                        <EventDetailsLabel>Location:</EventDetailsLabel>
                                        <span>{selectedEvent.location}</span>
                                        <EventDetailsLabel>Status:</EventDetailsLabel>
                                        <span>{selectedEvent.status}</span>
                                        <EventDetailsLabel>Contact:</EventDetailsLabel>
                                        <span>{selectedEvent.customerEmail || 'N/A'} | {selectedEvent.customerPhone || 'N/A'}</span>
                                        <EventDetailsLabel>Deposit:</EventDetailsLabel>
                                        <span>₦{selectedEvent.deposit || 0}</span>
                                        <EventDetailsLabel>Payment:</EventDetailsLabel>
                                        <span>{selectedEvent.paymentType}</span>
                                        <EventDetailsLabel>Menu Items:</EventDetailsLabel>
                                        <span>{selectedEvent?.orderItems?.map(item => `${item.name} (x${item.quantity})`).join(', ') || 'None'}</span>
                                        <EventDetailsLabel>Notes:</EventDetailsLabel>
                                        <span>{selectedEvent.notes || 'None'}</span>
                                        <EventDetailsLabel>Reminder:</EventDetailsLabel>
                                        <span>{selectedEvent.reminder}</span>
                                    </EventDetailsGrid>
                                    <ButtonGroup>
                                        <button
                                            onClick={() => setSelectedEvent(null)}
                                            className="px-4 py-2 bg-[#05431E] text-white rounded-md hover:bg-[#043818] transition font-weight-400 text-12px"
                                        >
                                            Close
                                        </button>
                                    </ButtonGroup>
                                </EventDetailsContent>
                            </div>
                        </ModalContent>
                    </Modal>
                )}

                <Modal isOpen={isModalOpen}>
                    <ModalContent>
                        <div className="flex h-full">
                            <Sidebar>
                                <h2 className="text-14px font-medium text-gray-800 mb-6">{isEditMode ? 'Edit Reservation' : 'New Reservation'}</h2>
                                <div className="space-y-5">
                                    <StepItem active={step === 1}>
                                        <div className="circle">1</div>
                                        <div>
                                            <p className="title">Event Details</p>
                                            <p className="desc">Basic and scheduling info</p>
                                        </div>
                                    </StepItem>
                                    <StepItem active={step === 2}>
                                        <div className="circle">2</div>
                                        <div>
                                            <p className="title">Customer & Payment</p>
                                            <p className="desc">Contact and payment details</p>
                                        </div>
                                    </StepItem>
                                    <StepItem active={step === 3}>
                                        <div className="circle">3</div>
                                        <div>
                                            <p className="title">Review & Menu</p>
                                            <p className="desc">Final review and menu</p>
                                        </div>
                                    </StepItem>
                                </div>
                            </Sidebar>
                            <Content>
                                <Form onSubmit={handleSubmit}>
                                    {step === 1 && (
                                        <div>
                                            <FormGroup>
                                                <Label>Customer Name</Label>
                                                <Input
                                                    name="title"
                                                    placeholder="Enter customer name"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </FormGroup>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormGroup>
                                                    <Label>Date</Label>
                                                    <Input
                                                        name="date"
                                                        type="date"
                                                        value={formData.date}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>Time</Label>
                                                    <Input
                                                        name="time"
                                                        type="time"
                                                        value={formData.time}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </FormGroup>
                                            </div>
                                            <FormGroup>
                                                <Label>Attendees</Label>
                                                <Input
                                                    name="attendees"
                                                    type="number"
                                                    placeholder="Enter number"
                                                    value={formData.attendees}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                    required
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label>Location</Label>
                                                <Input
                                                    name="location"
                                                    placeholder="Enter location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label>Status</Label>
                                                <Select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="CONFIRMED">Confirmed</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                    <option value="NO_SHOW">No Show</option>
                                                    <option value="COMPLETED">Completed</option>
                                                </Select>
                                            </FormGroup>
                                            <ButtonGroup>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsModalOpen(false)}
                                                    className="px-4 py-2 text-12px font-weight-400 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={nextStep}
                                                    className="px-4 py-2 bg-[#05431E] text-white rounded-md hover:bg-[#043818] transition font-weight-400 text-12px"
                                                >
                                                    Next
                                                </button>
                                            </ButtonGroup>
                                        </div>
                                    )}
                                    {step === 2 && (
                                        <div>
                                            <FormGroup>
                                                <Label>Email</Label>
                                                <Input
                                                    name="customerEmail"
                                                    type="email"
                                                    placeholder="Enter email"
                                                    value={formData.customerEmail}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label>Phone</Label>
                                                <Input
                                                    name="customerPhone"
                                                    type="tel"
                                                    placeholder="Enter phone"
                                                    value={formData.customerPhone}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label>Special Requests</Label>
                                                <TextArea
                                                    name="notes"
                                                    placeholder="Enter requests"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                />
                                            </FormGroup>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormGroup>
                                                    <Label>Deposit (₦)</Label>
                                                    <Input
                                                        name="deposit"
                                                        type="number"
                                                        placeholder="Enter amount"
                                                        value={formData.deposit}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>Payment Type</Label>
                                                    <Select
                                                        name="paymentType"
                                                        value={formData.paymentType}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="CASH">Cash</option>
                                                        <option value="TRANSFER">Transfer</option>
                                                    </Select>
                                                </FormGroup>
                                            </div>
                                            <FormGroup>
                                                <Label>Reminder</Label>
                                                <Select
                                                    name="reminder"
                                                    value={formData.reminder}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="30 minutes before">30 min before</option>
                                                    <option value="1 hour before">1 hour before</option>
                                                    <option value="1 day before">1 day before</option>
                                                    <option value="None">None</option>
                                                </Select>
                                            </FormGroup>
                                            <ButtonGroup>
                                                <button
                                                    type="button"
                                                    onClick={prevStep}
                                                    className="px-4 py-2 text-12px font-weight-400 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={nextStep}
                                                    className="px-4 py-2 bg-[#05431E] text-white rounded-md hover:bg-[#043818] transition font-weight-400 text-12px"
                                                >
                                                    Next
                                                </button>
                                            </ButtonGroup>
                                        </div>
                                    )}
                                    {step === 3 && (
                                        <div>
                                            <h3 className="text-14px font-medium text-gray-900 mb-3">Review Your Reservation</h3>
                                            <div className="space-y-3">
                                                <ReviewItem>
                                                    <span>Customer</span>
                                                    <span className="font-weight-400">{formData.title}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Date & Time</span>
                                                    <span className="font-weight-400">{formData.date} at {formData.time}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Attendees</span>
                                                    <span className="font-weight-400">{formData.attendees}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Location</span>
                                                    <span className="font-weight-400">{formData.location}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Status</span>
                                                    <span className="font-weight-400">{formData.status}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Contact</span>
                                                    <span className="font-weight-400">{formData.customerEmail} | {formData.customerPhone}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Deposit</span>
                                                    <span className="font-weight-400">₦{formData.deposit}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Payment</span>
                                                    <span className="font-weight-400">{formData.paymentType}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Requests</span>
                                                    <span className="font-weight-400">{formData.notes || 'None'}</span>
                                                </ReviewItem>
                                                <ReviewItem>
                                                    <span>Reminder</span>
                                                    <span className="font-weight-400">{formData.reminder}</span>
                                                </ReviewItem>
                                            </div>

                                            <FormGroup>
                                                <Label>Menu Items</Label>
                                                <MenuPicker>
                                                    <MenuSearch
                                                        placeholder="Search menu..."
                                                        value={menuSearch}
                                                        onChange={(e) => setMenuSearch(e.target.value)}
                                                    />
                                                    <MenuList>
                                                        {filteredMenuItems.map(item => (
                                                            <MenuItemOption
                                                                key={item.id}
                                                                selected={formData.orderItems?.some(i => i.menuItemId === item.id) || false}
                                                                onClick={() => handleMenuItemToggle(item)}
                                                            >
                                                                <span>{item.name} (₦{item.price})</span>
                                                                {formData.orderItems?.some(i => i.menuItemId === item.id) && (
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={formData.orderItems?.find(i => i.menuItemId === item.id)?.quantity || 1}
                                                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        style={{ width: '60px', padding: '0.375rem' }}
                                                                    />
                                                                )}
                                                            </MenuItemOption>
                                                        ))}
                                                    </MenuList>
                                                    {formData.orderItems?.length > 0 && (
                                                        <MenuItemPreview>
                                                            <p className="text-11px font-medium mb-2">Selected:</p>
                                                            {formData.orderItems.map(item => (
                                                                <div key={item.menuItemId} className="flex justify-between items-center py-1">
                                                                    <span className="text-12px font-weight-300">{item.name} - ₦{item.price} x {item.quantity}</span>
                                                                    <button
                                                                        onClick={() => handleMenuItemToggle(item)}
                                                                        className="text-red-500 hover:text-red-600"
                                                                    >
                                                                        <Trash size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </MenuItemPreview>
                                                    )}
                                                </MenuPicker>
                                            </FormGroup>

                                            <ButtonGroup>
                                                <button
                                                    type="button"
                                                    onClick={prevStep}
                                                    className="px-4 py-2 text-12px font-weight-400 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-[#05431E] text-white rounded-md hover:bg-[#043818] transition font-weight-400 text-12px"
                                                    disabled={false} // Adjust if needed for loading state
                                                >
                                                    {isEditMode ? 'Update' : 'Confirm'}
                                                </button>
                                            </ButtonGroup>
                                        </div>
                                    )}
                                </Form>
                            </Content>
                        </div>
                    </ModalContent>
                </Modal>
            </CalendarWrapper>
        </div>
    );
}