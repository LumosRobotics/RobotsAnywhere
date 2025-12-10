'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function EmbeddedDesignPage() {
  const router = useRouter();

  return (
    <div className="embedded-design-page" style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            marginBottom: '2rem',
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#333' }}>
          Embedded Design Services
        </h1>

        <section style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555', marginBottom: '2rem' }}>
            At Robots Anywhere, we offer comprehensive embedded systems design services to bring your
            robotics and automation projects to life. Our experienced team provides end-to-end solutions
            from concept to production.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#333' }}>
            System and PCB Design
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginBottom: '1.5rem' }}>
            We specialize in complete system architecture and PCB design tailored to your specific requirements:
          </p>
          <ul style={{
            fontSize: '1.1rem',
            lineHeight: '2',
            color: '#555',
            listStyle: 'disc',
            paddingLeft: '2rem',
            marginBottom: '1.5rem'
          }}>
            <li>Custom PCB schematic design and layout</li>
            <li>Multi-layer board design for complex systems</li>
            <li>High-speed digital design and signal integrity analysis</li>
            <li>Power supply design and power management</li>
            <li>Component selection and bill of materials optimization</li>
            <li>Design for manufacturing (DFM) and design for test (DFT)</li>
            <li>Prototype fabrication and assembly</li>
            <li>EMC/EMI compliance and testing</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#333' }}>
            Firmware Development
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginBottom: '1.5rem' }}>
            Our firmware engineers develop robust, efficient embedded software:
          </p>
          <ul style={{
            fontSize: '1.1rem',
            lineHeight: '2',
            color: '#555',
            listStyle: 'disc',
            paddingLeft: '2rem',
            marginBottom: '1.5rem'
          }}>
            <li>Bare-metal firmware development for microcontrollers</li>
            <li>Real-time operating system (RTOS) implementation</li>
            <li>Device driver development for sensors and peripherals</li>
            <li>Communication protocol implementation (I2C, SPI, UART, CAN, Ethernet)</li>
            <li>Motor control and motion planning algorithms</li>
            <li>Low-power optimization and battery management</li>
            <li>Bootloader development and over-the-air (OTA) updates</li>
            <li>Firmware testing and validation</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#333' }}>
            Software Integration
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginBottom: '1.5rem' }}>
            We provide complete software solutions that connect your embedded systems to the cloud and end users:
          </p>
          <ul style={{
            fontSize: '1.1rem',
            lineHeight: '2',
            color: '#555',
            listStyle: 'disc',
            paddingLeft: '2rem',
            marginBottom: '1.5rem'
          }}>
            <li>IoT connectivity and cloud integration (AWS IoT, Azure IoT, Google Cloud)</li>
            <li>Mobile app development for remote control and monitoring</li>
            <li>Web dashboard development for data visualization</li>
            <li>RESTful API design and implementation</li>
            <li>MQTT, CoAP, and other IoT protocol integration</li>
            <li>Data logging and analytics</li>
            <li>Machine learning model deployment on edge devices</li>
            <li>Cybersecurity implementation and secure authentication</li>
          </ul>
        </section>

        <section style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#333' }}>
            Our Development Process
          </h2>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>1. Requirements Analysis:</strong> We work closely with you to understand your project goals,
              technical requirements, and constraints.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>2. System Architecture:</strong> We design the overall system architecture, selecting appropriate
              components and technologies.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>3. Design & Development:</strong> Our team creates detailed PCB designs and develops firmware
              and software in parallel.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>4. Prototyping & Testing:</strong> We build prototypes and conduct thorough testing to validate
              the design.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>5. Manufacturing Support:</strong> We assist with production setup and provide ongoing support
              as needed.
            </p>
          </div>
        </section>

        <section style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Ready to Start Your Project?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            Contact us today to discuss your embedded systems design needs and receive a custom quote.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:info@robotsanywhere.com"
              style={{
                padding: '1rem 2rem',
                background: 'white',
                color: '#007bff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              Email Us
            </a>
            <a
              href="tel:+15551234567"
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                border: '2px solid white',
                display: 'inline-block'
              }}
            >
              Call: +1 (555) 123-4567
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
