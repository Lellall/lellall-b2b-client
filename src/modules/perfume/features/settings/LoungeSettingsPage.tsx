import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Building, Sms, Call, Clock, ShieldSecurity, Notification } from 'iconsax-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  p {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
  }
`;

const SectionCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 12px;

  svg {
    color: #05431E;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }

  input, select, textarea {
    padding: 10px 14px;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    font-size: 14px;
    color: #111827;
    background: #F9FAFB;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #05431E;
      box-shadow: 0 0 0 2px rgba(5, 67, 30, 0.1);
      background: #FFFFFF;
    }
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F3F4F6;

  &:last-child {
    border-bottom: none;
  }

  div {
    display: flex;
    flex-direction: column;

    span {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }

    small {
      font-size: 12px;
      color: #6B7280;
    }
  }
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #05431E;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const PrimaryButton = styled.button`
  background: #05431E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #043417;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const StoreSettingsPage: React.FC = () => {
  const { user, restaurant } = useSelector((state: RootState) => state.auth);
  const currentStoreName = restaurant?.name || user?.firstName ? `${user?.firstName}'s Store` : 'Store Settings';

  const [formData, setFormData] = useState({
    storeName: currentStoreName,
    conciergeEmail: 'concierge@sanctumairportstores.com',
    phoneNumber: '+234 800 SANCTUM',
    operatingHours: '24 Hours (All Week)',
    maxGuests: '2',
    dressCode: 'Smart Casual / Business Attire',
    emailAlerts: true,
    smsAlerts: false,
    autoApproveRenewals: false,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Store settings saved successfully');
    }, 600);
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>Store Settings</h1>
        <p>Manage store profile, operations, and membership rules</p>
      </PageHeader>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SectionCard>
          <SectionTitle>
            <Building size="20" />
            <span>Store Information</span>
          </SectionTitle>
          <GridContainer>
            <FormGroup>
              <label>Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Concierge Email</label>
              <input
                type="email"
                name="conciergeEmail"
                value={formData.conciergeEmail}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Contact Phone</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Operating Hours</label>
              <input
                type="text"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
              />
            </FormGroup>
          </GridContainer>
        </SectionCard>

        <SectionCard>
          <SectionTitle>
            <ShieldSecurity size="20" />
            <span>Membership & Access Rules</span>
          </SectionTitle>
          <GridContainer>
            <FormGroup>
              <label>Max Guests per Member</label>
              <select name="maxGuests" value={formData.maxGuests} onChange={handleChange}>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </FormGroup>
            <FormGroup>
              <label>Dress Code Policy</label>
              <input
                type="text"
                name="dressCode"
                value={formData.dressCode}
                onChange={handleChange}
              />
            </FormGroup>
          </GridContainer>
        </SectionCard>

        <SectionCard>
          <SectionTitle>
            <Notification size="20" />
            <span>Notifications & Preferences</span>
          </SectionTitle>
          <ToggleRow>
            <div>
              <span>Email Alerts for New Applications</span>
              <small>Receive instant notifications when a new VIP application is submitted</small>
            </div>
            <CheckboxInput
              type="checkbox"
              name="emailAlerts"
              checked={formData.emailAlerts}
              onChange={handleChange}
            />
          </ToggleRow>
          <ToggleRow>
            <div>
              <span>SMS Concierge Alerts</span>
              <small>Notify front desk staff via SMS when high-tier members check in</small>
            </div>
            <CheckboxInput
              type="checkbox"
              name="smsAlerts"
              checked={formData.smsAlerts}
              onChange={handleChange}
            />
          </ToggleRow>
        </SectionCard>

        <ButtonGroup>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </PrimaryButton>
        </ButtonGroup>
      </form>
    </PageContainer>
  );
};

export default StoreSettingsPage;
