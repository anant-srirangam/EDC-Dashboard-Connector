package org.eclipse.edc.extensions.control.plane.operators;


import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.AllArgsConstructor;
import org.eclipse.edc.policy.model.Operator;
import org.eclipse.edc.spi.monitor.Monitor;
import org.eclipse.edc.spi.query.CriterionOperatorRegistry;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.List;

@Path("/operators")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@AllArgsConstructor
public class OperatorsApiController {
    @POST
    @Path("/edc")
    public Response getValidEdcCriterionOperators() {
        List<String> validOperators = List.of(
          CriterionOperatorRegistry.ILIKE,
          CriterionOperatorRegistry.IN,
          CriterionOperatorRegistry.LIKE,
          CriterionOperatorRegistry.CONTAINS,
          CriterionOperatorRegistry.EQUAL,
          CriterionOperatorRegistry.GREATER_THAN,
          CriterionOperatorRegistry.GREATER_THAN_EQUAL,
          CriterionOperatorRegistry.LESS_THAN,
          CriterionOperatorRegistry.LESS_THAN_EQUAL,
          CriterionOperatorRegistry.NOT_EQUAL
        );

        return Response.status(200).entity(Map.of("operators", validOperators)).build();
    }

    @POST
    @Path("/odrl")
    public Response getValidOdrlCriterionOperators() {
        List<Operator> validOperators = new ArrayList<>(Arrays.asList(Operator.values()));
        return Response.status(200).entity(Map.of("operators", validOperators)).build();
    }
}
