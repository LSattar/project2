import { NavLink } from './NavLink.tsx';
import React from "react"

type LinkType = {
    linkName: string;
    linkDestination: string;
}

export const NavBar = () => {
    const links: LinkType[] = [
      {linkName: "Home", linkDestination: "/"},
      { linkName: "Clients", linkDestination: "/clients" },
      {linkName: "Employment Sectors", linkDestination: "/employment-sectors"},
      { linkName: "Tax Returns", linkDestination: "/tax-returns" },
      { linkName: "Payments", linkDestination: "/payments"}
    ];
  
    return (
      <nav>
        {links.map((link) => (
          <div key={link.linkName}>
            <NavLink linkObject={link} />
          </div>
        ))}
      </nav>
    );
  };