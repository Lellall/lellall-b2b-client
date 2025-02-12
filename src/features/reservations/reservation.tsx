import styled from "styled-components"

const List = ({ label, value }) => {
  return (
    <div>
      <p className="font-[300] text-[#05431E]">{label}</p>
      <p className="font-[300] text-[#05431E]">{value}</p>
    </div>
  )
}

function Reservation() {
  return (
    <div>
      <div>
        <img
          width={"100%"}
          className="h-[400px] rounded-md"
          src="https://img.freepik.com/free-vector/ai-technology-microchip-background-vector-digital-transformation-concept_53876-117808.jpg?t=st=1737982469~exp=1737986069~hmac=ad896350dea9a1ee22c86fae30bca498b58b426f4f05894c0c3e5c48e6c3be34&w=2000"
        />
      </div>

      <div className="my-4">
        <h2 className="text-[#05431E] font-[500] text-[20px] my-3">Reservations Details</h2>
        <Card>
          <div>
            <List label={"Table Number"} value={"001"} />
          </div>

          <div>
            <List label={"Pax Number"} value={"5 Persons "} />
          </div>
          <div>
            <List label={"Pax Number"} value={"5 Persons "} />
          </div>
          <div>
            <List label={"Pax Number"} value={"5 Persons "} />
          </div>
          <div>
            <List label={"Pax Number"} value={"5 Persons "} />
          </div>
        </Card>
      </div>
      <div className="my-3">
        <h2 className="text-[#05431E] font-[500] text-[20px] my-3">Customer Details</h2>
        <Card>
          <div>
            <List label={"Title"} value={"Mr"} />
          </div>

          <div>
            <List label={"Full name"} value={"John Doe "} />
          </div>
          <div>
            <List label={"Phone Number"} value={"081234567"} />
          </div>
          <div>
            <List label={"Email"} value={"johdoe@gmail.com "} />
          </div>
        </Card>
      </div>
      <div className="my-3">
        <h2 className="text-[#05431E] font-[500] text-[20px] my-3">Additional Information</h2>
        <Card>
          <div>
            <List label={"Customer ID"} value={"001"} />
          </div>

          <div>
            <List label={"Payment Method"} value={"Visa Card "} />
          </div>
          <div>
            <List label={"Name"} value={"5 Persons "} />
          </div>
          <div>
            <List label={"Card Number"} value={"****4356 352 "} />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Reservation

const Card = styled.div`
  /* flex gap-4 bg-white p-3 rounded-md */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 20px;
  border-radius: 10px;
  background: #fff;
`
