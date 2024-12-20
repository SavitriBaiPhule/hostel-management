import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "../ui/label"
import { AlertCircle } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { createNewPayment } from '@/actions/payments/payment';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Student } from '@prisma/client';
import qrImage from "../../images/qr.png"


const Payment = ({ studentInfo }: { studentInfo: Student }) => {
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ public_id: string; secure_url: string }[]>([]);

  const [referrenceNo, setReferrenceNo] = useState<string>("");

  const paymentDetails = {
    upi: {
      id: "9105969848@indianbk",
      name: "SAMAJ KALYAN GIRLS HOSTEL 100 CAPACITY"
    },
    qr: qrImage,
    netBanking: {
      bankName: "Indian Bank",
      accountNumber: "7811666491",
      ifscCode: "IDIB000K677",
      accountName: "Samaj Kalyan Girls Hostel 100 Capacity"
    }
  };

  // @ts-expect-error-ignore
  const handleSuccess = (result) => {
    setUploadedImage(
      (prev) => [...prev, { public_id: result.info.public_id, secure_url: result.info.secure_url }]
    )
  }

  const onUpload = async () => {

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const { error, msg } = await createNewPayment({
      paymentMethod,
      referrenceNo,
      screenshotImageUrl: uploadedImage,
      amount: studentInfo?.isRegistered ? studentInfo?.amountToPay : 6000
    });

    if (error) {
      console.error(msg);
      return;
    }
    toast.success(msg);

    setUploadedImage([]);
    setPaymentMethod(null);

  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-tr from-purple-400 via-violet-400 to-indigo-400 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Make Mess Payment</CardTitle>
        <CardDescription className="text-blue-100">Choose your payment method and confirm the payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
          <span className="text-lg font-medium">Amount Due:</span>
          <span className="text-2xl font-bold">₹{studentInfo?.isRegistered ? studentInfo?.amountToPay : "6000"}</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select onValueChange={(value) => setPaymentMethod(value)}>
            <SelectTrigger id="payment-method" className="w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="qr">QR Code</SelectItem>
              <SelectItem value="netBanking">Net Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Payment Details:</h3>
              {paymentMethod === 'upi' && (
                <>
                  <p><strong>UPI ID:</strong> {paymentDetails.upi.id}</p>
                  <p><strong>Name:</strong> {paymentDetails.upi.name}</p>
                </>
              )}
              {paymentMethod === 'qr' && (
                <Image src={paymentDetails.qr} width={250} height={250} alt="qr" />
              )}
              {paymentMethod === 'netBanking' && (
                <>
                  <p><strong>Bank Name:</strong> {paymentDetails.netBanking.bankName}</p>
                  <p><strong>Account Number:</strong> {paymentDetails.netBanking.accountNumber}</p>
                  <p><strong>IFSC Code:</strong> {paymentDetails.netBanking.ifscCode}</p>
                  <p><strong>Account Name:</strong> {paymentDetails.netBanking.accountName}</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot">Attach Payment Screenshot</Label>

              <CldUploadWidget options={{ maxFiles: 2 }} onSuccess={handleSuccess} uploadPreset="hostel">
                {({ open }) => {
                  return (
                    <Button onClick={() => { open() }} className="w-full bg-gradient-to-tr from-violet-400 to-violet-500 hover:from-violet-500 hover:to-violet-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform">
                      Upload Screenshots
                    </Button>

                  );
                }}
              </CldUploadWidget>
              <div className="space-y-2">
                <Label htmlFor="referrence-no">Referrence No</Label>
                <Input type="text" id="referrence-no" className="w-full border border-gray-200 rounded-lg p-3" placeholder="Enter referrence number (For multiple transactions, separate by comma)"
                  value={referrenceNo}
                  onChange={(e) => setReferrenceNo(e.target.value)} />
              </div>

            </div>
            {
              uploadedImage.length > 0 ?
                <div className="space-y-2">
                  <Label>Uploaded Images</Label>
                  <div className="flex space-x-2">
                    {uploadedImage.map((image) => (
                      <Image key={image.public_id} src={image.secure_url} width={100} height={100} alt="uploaded image" />
                    ))}
                  </div>
                </div>
                :
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <p className="text-sm">Please attach a screenshot of your payment for verification purposes.</p>
                </div>
            }
          </div>
        )}
      </CardContent>
      <CardFooter>
        {
          uploadedImage &&
          <Button onClick={onUpload} className="w-fit flex ml-auto bg-gradient-to-tr from-violet-400 to-violet-500 hover:from-violet-500 hover:to-violet-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
            Confirm Payment
          </Button>
        }
      </CardFooter>
    </Card>
  )
}

export default Payment