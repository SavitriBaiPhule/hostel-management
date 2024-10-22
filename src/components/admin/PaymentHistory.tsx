import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CldImage } from "next-cloudinary";
import { Button } from "../ui/button";
import { Check, Eye, X } from "lucide-react";
import { updatePaymentStatus } from "@/actions/payments/payment";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Input } from '../ui/input';
import { Payment } from '@prisma/client';


interface PaymentHistoryProps extends Payment {
  student: {
    name: string;
    id: string;
  }
}


const PaymentHistory = ({ paymentHistory }: {paymentHistory: PaymentHistoryProps[]}) => {
  const [payments, setPayments] = useState(paymentHistory);
  const [selectedImage, setSelectedImage] = useState({
    imageUrl: "",
    referrenceNo: "" 
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<bigint | null>(null);
  const [assignedRoom, setAssignedRoom] = useState<string | null>(null);

  const updatePayment = async (id: bigint, type: string) => {
    type = type === "approve" ? "Paid" : "Rejected";
    const { error, msg } = await updatePaymentStatus(id, type, assignedRoom!);

    if (error) {
      toast.error(msg);
    } else {
      toast.success(msg);
      const updatedPayments = payments.map((payment) => {
        if (payment.id === BigInt(id)) {
          payment.status = type;
        }
        return payment;
      });
      setIsRoomDialogOpen(false);
      setPayments(updatedPayments);
    }
  }

  const openImageDialog = (imageUrl: string, referrenceNo?: string) => {
    setSelectedImage({
      imageUrl,
      referrenceNo: referrenceNo || ""
    });
    setIsDialogOpen(true);
  }

  const openRoomDialog = (id: bigint, amount: number) => {
    if (amount === 3500) {
      updatePayment(id, "approve");
      return;
    }
    setSelectedRoom(id);
    setIsRoomDialogOpen(true);
  }

  useEffect(() => {
    if (paymentHistory) {
      setPayments(paymentHistory);
    }
  }, [paymentHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View all past transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Payment Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments && payments.slice().reverse().map((payment: PaymentHistoryProps) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.createdAt).toDateString()} {new Date(payment.createdAt).toLocaleTimeString()}</TableCell>
                  <TableCell>{payment.student.name}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <CldImage
                      src={payment.screenshotImageUrl ?? ""}
                      alt="Payment Proof"
                      width={50}
                      height={50}
                      className="object-cover rounded-lg cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${payment.status === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {
                      payment.status === "Pending" &&
                      <>
                        <Button onClick={() => updatePayment(payment.id, "reject")} variant="outline" className="mr-2">
                          <X size={20} />
                        </Button>
                        <Button onClick={() => { openRoomDialog(payment.id, payment.amount) }} variant="outline" className="mr-2">
                          <Check size={20} />
                        </Button>
                      </>
                    }
                    <Button onClick={() => openImageDialog(
                      payment.screenshotImageUrl!,
                      payment.referrenceNo || ""
                    )} variant="outline" className="mr-2">
                      <Eye size={20} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Proof</AlertDialogTitle>
            <AlertDialogDescription>
              <CldImage
                src={selectedImage.imageUrl}
                alt="Payment Proof"
                width={400}
                height={400}
                className="object-contain w-full h-full"
              />
              <p className="text-gray-600 w-full border-b border-gray-200 pb-4">
                Referrence No: {selectedImage.referrenceNo}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Proof</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Please assign a room to this student?</p>
              <div className="mt-4">
                <Input onChange={(e) => { setAssignedRoom(e.target.value) }} placeholder="Room Number" type='number' />
              </div>
              <div className="flex justify-end mt-4">
                <AlertDialogCancel onClick={() => setIsRoomDialogOpen(false)} className="mr-2">Cancel</AlertDialogCancel>
                <Button onClick={() => updatePayment(selectedRoom!, "approve")} variant="outline">Approve</Button>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}



export default PaymentHistory;