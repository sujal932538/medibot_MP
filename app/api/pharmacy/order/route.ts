import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Create a new medicine order
export async function POST(request: NextRequest) {
  try {
    const {
      patientId,
      pharmacyId,
      medicines,
      deliveryAddress,
      patientPhone,
      patientName,
      specialInstructions,
    } = await request.json();

    if (!patientId || !pharmacyId || !medicines || !deliveryAddress || !patientPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate medicines array
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return NextResponse.json(
        { error: "Medicines array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = medicines.reduce((total, medicine) => {
      return total + (medicine.price * medicine.quantity);
    }, 0);

    // Create order data
    const orderData = {
      patientId,
      pharmacyId,
      medicines: medicines.map(medicine => ({
        id: medicine.id,
        name: medicine.name,
        quantity: medicine.quantity,
        price: medicine.price,
      })),
      totalAmount,
      deliveryAddress,
      patientPhone,
      patientName,
      specialInstructions: specialInstructions || "",
      status: "pending" as "pending",
      orderDate: new Date().toISOString(),
    };

    // Save order to database
    const orderId = await convex.mutation(api.pharmacy_orders.createMedicineOrder, orderData);

    // Send notification to pharmacy
    await notifyPharmacy(pharmacyId, orderData);

    // Send confirmation to patient
    await notifyPatient(patientId, orderData);

    return NextResponse.json({
      success: true,
      message: "Medicine order created successfully",
      orderId,
      orderData,
    });

  } catch (error) {
    console.error("Error creating medicine order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// Get orders for a patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const pharmacyId = searchParams.get("pharmacyId");
    const status = searchParams.get("status");

    if (!patientId && !pharmacyId) {
      return NextResponse.json(
        { error: "Either patientId or pharmacyId is required" },
        { status: 400 }
      );
    }

    let orders;

    if (patientId) {
      orders = await convex.query(api.pharmacy_orders.getMedicineOrders, { patientId });
    } else if (pharmacyId) {
      orders = await convex.query(api.pharmacy_orders.getPharmacyOrders, { pharmacyId: pharmacyId as any });
    }

    // Filter by status if specified
    if (status && orders) {
      orders = orders.filter((order: any) => order.status === status);
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// Update order status
export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status, deliveryTime, trackingNumber, notes } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update order in database
    const updatedOrder = await convex.mutation(api.pharmacy_orders.updateMedicineOrder, {
      id: orderId,
      status: status as any,
      deliveryTime,
      trackingNumber,
      notes,
    });

    // Send status update notification
    await sendStatusUpdateNotification(orderId, status);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Helper function to notify pharmacy about new order
async function notifyPharmacy(pharmacyId: string, orderData: any) {
  try {
    // Get pharmacy details
    const pharmacy = await convex.query(api.pharmacies.getPharmacyById, { id: pharmacyId as any });
    
    if (pharmacy) {
      console.log(`Notification sent to pharmacy: ${pharmacy.name}`);
      console.log(`New order received: ${orderData.patientName} - ${orderData.medicines.length} medicines`);
      
      // TODO: Implement actual notification logic
      // - Send email to pharmacy
      // - Send SMS notification
      // - In-app notification
    }
  } catch (error) {
    console.error("Error notifying pharmacy:", error);
  }
}

// Helper function to notify patient about order confirmation
async function notifyPatient(patientId: string, orderData: any) {
  try {
    console.log(`Notification sent to patient: ${orderData.patientName}`);
    console.log(`Order confirmed: ${orderData.medicines.length} medicines - Total: $${orderData.totalAmount}`);
    
    // TODO: Implement actual notification logic
    // - Send email to patient
    // - Send SMS confirmation
    // - In-app notification
  } catch (error) {
    console.error("Error notifying patient:", error);
  }
}

// Helper function to send status update notifications
async function sendStatusUpdateNotification(orderId: string, status: string) {
  try {
    // Get order details
    const order = await convex.query(api.pharmacy_orders.getMedicineOrderById, { id: orderId as any });
    
    if (order) {
      const statusMessages = {
        confirmed: "Your order has been confirmed and is being prepared",
        preparing: "Your order is being prepared and will be ready soon",
        out_for_delivery: "Your order is out for delivery",
        delivered: "Your order has been delivered successfully",
        cancelled: "Your order has been cancelled",
      };

      const message = statusMessages[status as keyof typeof statusMessages] || "Your order status has been updated";
      
      console.log(`Status update notification sent: ${message}`);
      
      // TODO: Implement actual notification logic
      // - Send email to patient
      // - Send SMS notification
      // - In-app notification
    }
  } catch (error) {
    console.error("Error sending status update notification:", error);
  }
}
