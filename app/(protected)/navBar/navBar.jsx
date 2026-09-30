import React from "react";
import Image from "next/image";

function NavBar() {
  return (
    <div
      className="navbar"
      style={{
        display: "flex",
        alignItems: "center",
        height: "70px",
        borderBottom: "1px solid #e7e7e7",
      }}
    >
      <Image
        src="/logo.webp"
        alt="GharSaDukan Logo"
        width={50}
        height={50}
        style={{ marginRight: "20px" }}
      />
      <h2 style={{ margin: 0, display: "flex", letterSpacing: ".5px" }}>
        GharSa<p style={{ color: "#8BC34A" }}>Dukan</p>
      </h2>
    </div>
  );
}

export default NavBar;