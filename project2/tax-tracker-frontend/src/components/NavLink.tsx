import { Link } from "react-router-dom";
import React from "react";

type NavLinkProps = {
    linkObject: {
      linkName: string;
      linkDestination: string;
    };
  };
  
  export const NavLink = ({ linkObject }: { linkObject: { linkName: string; linkDestination: string } }) => {
    const { linkDestination, linkName } = linkObject;
    return <Link to={linkDestination}>{linkName}</Link>;
  };
  